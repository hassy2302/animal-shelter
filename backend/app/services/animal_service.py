import asyncio
import logging
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))
from app.models.animal import Animal, AnimalListResponse
from app.cache.manager import CacheManager
from app.config import settings
from app import services

logger = logging.getLogger(__name__)

UPKIND_DOG = "417000"
UPKIND_CAT = "422400"
UPKIND_ETC = "429900"

SPECIES_KEYWORDS = {
    "🐹 햄스터": ["햄스터"],
    "🐰 토끼": ["토끼"],
    "🐢 거북이": ["거북"],
    "🦔 고슴도치": ["고슴도치"],
    "🐦 새": ["앵무", "잉꼬", "금조", "사랑새", "카나리아"],
}
KNOWN_KEYWORDS = [kw for kws in SPECIES_KEYWORDS.values() for kw in kws]


RODENT_KEYWORDS = ["쥐", "래트", "레트", "rat", "팬시마우스", "팬더마우스", "팬마", "기니피그", "데구"]


def _sort_key(a: dict) -> int:
    upkind = a.get("upkind", "")
    kind = (a.get("kindNm", "") + a.get("kindFullNm", "")).lower()
    ai_kind = a.get("aiKindNm", "")
    if upkind == UPKIND_ETC:
        if "햄스터" in kind or ai_kind == "햄스터":
            return 0
        if any(kw in kind for kw in RODENT_KEYWORDS) or ai_kind in ("기니피그", "다람쥐", "페럿"):
            return 1
        return 2
    if upkind == UPKIND_CAT:
        return 3
    return 4


def _matches_species(kind_nm: str, upkind: str, selected: str, ai_kind_nm: str = "") -> bool:
    from app.services.image_classifier import AI_SPECIES_MAP
    if selected == "전체":
        return True
    if selected == "🐶 강아지":
        return upkind == UPKIND_DOG
    if selected == "🐱 고양이":
        return upkind == UPKIND_CAT
    if upkind in (UPKIND_DOG, UPKIND_CAT):
        return False
    # 기타축종이고 AI 분류 결과가 있으면 우선 사용
    if upkind == UPKIND_ETC and ai_kind_nm:
        ai_species = AI_SPECIES_MAP.get(ai_kind_nm)  # None이면 기타(기니피그·뱀 등)
        if selected == "기타":
            return ai_species is None
        return ai_species == selected
    # AI 결과 없으면 kindNm 텍스트 매칭
    if selected == "기타":
        return not any(kw in kind_nm for kw in KNOWN_KEYWORDS)
    keywords = SPECIES_KEYWORDS.get(selected, [])
    return any(kw in kind_nm for kw in keywords)


def _matches_search(a: dict, search: str) -> bool:
    if not search:
        return True
    s = search.lower()
    return any(s in (a.get(f, "") or "").lower() for f in (
        "kindNm", "kindFullNm", "careNm", "happenPlace", "orgNm", "noticeNo", "specialMark"
    ))


def _matches_state(state: str, selected: str) -> bool:
    if selected == "all":
        return True
    if selected == "protect":
        return "보호" in state
    if selected == "complete":
        return "입양" in state or "종료" in state
    if selected == "etc":
        return "보호" not in state and "입양" not in state and "종료" not in state
    return True


async def _apply_cached_classifications(all_raw: list[dict], cache: CacheManager) -> None:
    """캐시에 저장된 AI 분류 결과를 동물 데이터에 적용."""
    etc_animals = [
        a for a in all_raw
        if a.get("upkind") == UPKIND_ETC and (a.get("popfile1") or a.get("popfile2"))
    ]
    for a in etc_animals:
        notice_no = a.get("noticeNo", "")
        if not notice_no:
            continue
        cached = await cache.get(f"img_classify:{notice_no}")
        if cached:
            a["aiKindNm"] = cached


async def _classify_in_background(
    all_raw: list[dict], cache: CacheManager, animals_key: str, fetched_at: datetime
) -> None:
    """백그라운드: 미분류 기타축종 동물을 Gemini로 분류 후 캐시 갱신."""
    from app.services.image_classifier import classify_image, CLASSIFY_CACHE_TTL

    targets = [
        a for a in all_raw
        if a.get("upkind") == UPKIND_ETC
        and (a.get("popfile1") or a.get("popfile2"))
        and not a.get("aiKindNm")
    ]
    if not targets:
        return

    logger.info(f"AI 이미지 분류 시작: {len(targets)}건")
    sem = asyncio.Semaphore(3)
    changed = False

    async def classify_one(a: dict) -> None:
        nonlocal changed
        async with sem:
            notice_no = a.get("noticeNo", "")
            image_url = a.get("popfile1") or a.get("popfile2", "")
            result = await classify_image(image_url)
            await cache.set(f"img_classify:{notice_no}", result, CLASSIFY_CACHE_TTL)
            a["aiKindNm"] = result
            changed = True

    await asyncio.gather(*[classify_one(a) for a in targets[:200]], return_exceptions=True)

    if changed:
        all_raw.sort(key=_sort_key)
        await cache.set(animals_key, {
            "items": all_raw,
            "fetched_at": fetched_at.isoformat(),
        }, settings.CACHE_TTL_ANIMALS)
        logger.info("AI 분류 완료, 캐시 업데이트")


async def _load_fresh(sido_code: str, sigungu_code: str, cache: CacheManager | None = None) -> tuple[list[dict], datetime]:
    from app.services import national_api

    all_raw = await national_api.fetch_all(sido_code, sigungu_code)

    if cache:
        await _apply_cached_classifications(all_raw, cache)

    all_raw.sort(key=_sort_key)
    return all_raw, datetime.now(KST)


async def get_animals_by_notice_nos(cache: CacheManager, notice_nos: list[str]) -> list[Animal]:
    key = CacheManager.animals_key("", "")
    cached = await cache.get(key)
    if cached:
        all_raw = cached["items"]
    else:
        all_raw, fetched_at = await _load_fresh("", "")
        await cache.set(key, {
            "items": all_raw,
            "fetched_at": fetched_at.isoformat(),
        }, settings.CACHE_TTL_ANIMALS)
    nos = set(notice_nos)
    return [Animal(**a) for a in all_raw if a.get("noticeNo") in nos]


async def get_animal_by_notice_no(cache: CacheManager, notice_no: str) -> Animal | None:
    key = CacheManager.animals_key("", "")
    cached = await cache.get(key)
    if cached:
        all_raw = cached["items"]
    else:
        all_raw, fetched_at = await _load_fresh("", "")
        await cache.set(key, {
            "items": all_raw,
            "fetched_at": fetched_at.isoformat(),
        }, settings.CACHE_TTL_ANIMALS)
    for a in all_raw:
        if a.get("noticeNo") == notice_no:
            return Animal(**a)
    return None


async def get_animals(
    cache: CacheManager,
    sido_code: str = "",
    sigungu_code: str = "",
    state: str = "protect",
    species: str = "전체",
    search: str = "",
    page: int = 1,
    per_page: int = 12,
    sort: str = "latest",
    force_refresh: bool = False,
) -> AnimalListResponse:
    key = CacheManager.animals_key(sido_code, sigungu_code)
    fetched_at = datetime.now(KST)

    if not force_refresh:
        cached = await cache.get(key)
        if cached:
            all_raw: list[dict] = cached["items"]
            fetched_at = datetime.fromisoformat(cached["fetched_at"])
        else:
            all_raw, fetched_at = await _load_fresh(sido_code, sigungu_code, cache)
            await cache.set(key, {
                "items": all_raw,
                "fetched_at": fetched_at.isoformat(),
            }, settings.CACHE_TTL_ANIMALS)
            asyncio.create_task(_classify_in_background(all_raw, cache, key, fetched_at))
    else:
        all_raw, fetched_at = await _load_fresh(sido_code, sigungu_code, cache)
        await cache.set(key, {
            "items": all_raw,
            "fetched_at": fetched_at.isoformat(),
        }, settings.CACHE_TTL_ANIMALS)
        asyncio.create_task(_classify_in_background(all_raw, cache, key, fetched_at))

    # 필터링
    filtered = [
        a for a in all_raw
        if _matches_state(a.get("processState", ""), state)
        and _matches_species(
            a.get("kindNm", "") + a.get("kindFullNm", ""),
            a.get("upkind", ""),
            species,
            a.get("aiKindNm", ""),
        )
        and _matches_search(a, search)
    ]

    # 정렬: 종류 우선순위(1차) + 날짜(2차)
    # happenDt는 "YYYYMMDD" 형식 → 문자열 비교 가능
    date_sign = -1 if sort == "latest" else 1
    filtered.sort(key=lambda a: (_sort_key(a), date_sign * int(a.get("happenDt", "0") or "0")))

    total = len(filtered)
    total_pages = max(1, -(-total // per_page))
    page = max(1, min(page, total_pages))
    start = (page - 1) * per_page
    page_items = filtered[start:start + per_page]

    return AnimalListResponse(
        items=[Animal(**a) for a in page_items],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
        fetched_at=fetched_at,
    )
