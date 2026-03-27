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


def _sort_key(a: dict) -> int:
    upkind = a.get("upkind", "")
    kind = a.get("kindNm", "") + a.get("kindFullNm", "")
    if upkind == UPKIND_ETC and "햄스터" in kind:
        return 0
    if upkind == UPKIND_ETC:
        return 1
    if upkind == UPKIND_CAT:
        return 2
    return 3


def _matches_species(kind_nm: str, upkind: str, selected: str) -> bool:
    if selected == "전체":
        return True
    if selected == "🐶 강아지":
        return upkind == UPKIND_DOG
    if selected == "🐱 고양이":
        return upkind == UPKIND_CAT
    if upkind in (UPKIND_DOG, UPKIND_CAT):
        return False
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


async def _load_fresh(sido_code: str, sigungu_code: str) -> tuple[list[dict], datetime]:
    from app.services import national_api, daejeon_api

    national_task = national_api.fetch_all(sido_code, sigungu_code)
    include_daejeon = not sido_code or sido_code == "6300000"
    daejeon_task = daejeon_api.fetch_all() if include_daejeon else asyncio.sleep(0)

    national_raw, daejeon_raw = await asyncio.gather(national_task, daejeon_task)
    daejeon_raw = daejeon_raw or []

    # 중복 제거 (noticeNo 기준)
    national_nos = {a.get("noticeNo", "") for a in national_raw}
    unique_daejeon = [a for a in daejeon_raw if a["noticeNo"] not in national_nos]

    all_raw = national_raw + unique_daejeon
    all_raw.sort(key=_sort_key)

    return all_raw, datetime.now(KST)


async def get_animals(
    cache: CacheManager,
    sido_code: str = "",
    sigungu_code: str = "",
    state: str = "protect",
    species: str = "전체",
    search: str = "",
    page: int = 1,
    per_page: int = 12,
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
            all_raw, fetched_at = await _load_fresh(sido_code, sigungu_code)
            await cache.set(key, {
                "items": all_raw,
                "fetched_at": fetched_at.isoformat(),
            }, settings.CACHE_TTL_ANIMALS)
    else:
        await cache.delete(key)
        all_raw, fetched_at = await _load_fresh(sido_code, sigungu_code)
        await cache.set(key, {
            "items": all_raw,
            "fetched_at": fetched_at.isoformat(),
        }, settings.CACHE_TTL_ANIMALS)

    # 필터링
    filtered = [
        a for a in all_raw
        if _matches_state(a.get("processState", ""), state)
        and _matches_species(a.get("kindNm", "") + a.get("kindFullNm", ""), a.get("upkind", ""), species)
        and _matches_search(a, search)
    ]

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
