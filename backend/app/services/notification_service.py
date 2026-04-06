import asyncio
import base64
import json
import logging
from datetime import datetime, timezone, timedelta

from app.cache.manager import CacheManager
from app.config import settings

KST = timezone(timedelta(hours=9))
logger = logging.getLogger(__name__)

_firebase_initialized = False

RODENT_KEYWORDS = ["쥐", "래트", "레트", "rat", "팬시마우스", "팬더마우스", "팬마", "기니피그", "데구", "친칠라"]
SPECIES_KEYWORDS = {
    "🐹 햄스터": ["햄스터"],
    "🐰 토끼": ["토끼"],
    "🐢 거북이": ["거북"],
    "🦔 고슴도치": ["고슴도치"],
    "🐦 새": ["앵무", "잉꼬", "금조", "사랑새", "카나리아"],
}
KNOWN_KEYWORDS = [kw for kws in SPECIES_KEYWORDS.values() for kw in kws]
UPKIND_DOG = "417000"
UPKIND_CAT = "422400"
UPKIND_ETC = "429900"

TOKENS_KEY = "notifications:tokens"
LAST_CHECKED_KEY = "notifications:last_checked_at"


def _init_firebase() -> bool:
    global _firebase_initialized
    if _firebase_initialized:
        return True
    if not settings.FCM_SERVICE_ACCOUNT_JSON:
        return False
    try:
        import firebase_admin
        from firebase_admin import credentials
        sa_bytes = base64.b64decode(settings.FCM_SERVICE_ACCOUNT_JSON)
        sa_dict = json.loads(sa_bytes)
        cred = credentials.Certificate(sa_dict)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        logger.info("Firebase 초기화 성공")
        return True
    except Exception as e:
        logger.error(f"Firebase 초기화 실패: {e}")
        return False


def _animal_categories(a: dict) -> set[str]:
    """동물이 속하는 카테고리 집합 반환"""
    upkind = a.get("upkind", "")
    kind = (a.get("kindNm", "") + a.get("kindFullNm", "")).lower()
    cats: set[str] = set()

    if upkind == UPKIND_DOG:
        cats.add("🐶 강아지")
    elif upkind == UPKIND_CAT:
        cats.add("🐱 고양이")
    elif upkind == UPKIND_ETC:
        if "햄스터" in kind:
            cats.add("🐹 햄스터")
        if any(kw in kind for kw in RODENT_KEYWORDS):
            cats.add("설치류")
        for label, kws in SPECIES_KEYWORDS.items():
            if label == "🐹 햄스터":
                continue
            if any(kw in kind for kw in kws):
                cats.add(label)
        is_known = "햄스터" in kind or any(kw in kind for kw in RODENT_KEYWORDS) or any(kw in kind for kw in KNOWN_KEYWORDS)
        if not is_known:
            cats.add("기타")

    return cats


# ── 토큰 저장소 ────────────────────────────────────────────────────────────────

async def _load_tokens(cache: CacheManager) -> dict[str, list[str]]:
    data = await cache.get(TOKENS_KEY)
    return data if isinstance(data, dict) else {}


async def _save_tokens(cache: CacheManager, tokens: dict) -> None:
    await cache.set(TOKENS_KEY, tokens, ttl=86400 * 3650)


async def register_token(cache: CacheManager, token: str, categories: list[str]) -> None:
    tokens = await _load_tokens(cache)
    tokens[token] = categories
    await _save_tokens(cache, tokens)


async def unregister_token(cache: CacheManager, token: str) -> None:
    tokens = await _load_tokens(cache)
    tokens.pop(token, None)
    await _save_tokens(cache, tokens)


# ── 마지막 체크 시각 ───────────────────────────────────────────────────────────

async def get_last_checked_at(cache: CacheManager) -> datetime | None:
    val = await cache.get(LAST_CHECKED_KEY)
    if isinstance(val, str):
        try:
            return datetime.fromisoformat(val)
        except Exception:
            pass
    return None


async def set_last_checked_at(cache: CacheManager, dt: datetime) -> None:
    await cache.set(LAST_CHECKED_KEY, dt.isoformat(), ttl=86400 * 3650)


# ── 신규 공고 감지 및 FCM 발송 ────────────────────────────────────────────────

async def send_new_animal_notifications(cache: CacheManager, all_animals: list[dict]) -> None:
    if not _init_firebase():
        logger.debug("FCM 미설정 — 알림 발송 생략")
        return

    from firebase_admin import messaging

    now = datetime.now(KST)
    last_checked = await get_last_checked_at(cache)

    if last_checked is None:
        # 첫 실행: 기준 시각만 저장하고 종료 (과거 공고 오탐 방지)
        await set_last_checked_at(cache, now)
        logger.info("알림 첫 실행 — 기준 시각 저장 후 종료 (오탐 방지)")
        return

    last_date_str = last_checked.strftime("%Y%m%d")
    new_animals = [
        a for a in all_animals
        if (a.get("happenDt") or "0") > last_date_str
        and "보호" in (a.get("processState") or "")
    ]

    await set_last_checked_at(cache, now)

    if not new_animals:
        logger.info("신규 공고 없음 — 알림 발송 생략")
        return

    logger.info(f"신규 공고 {len(new_animals)}건 감지")

    tokens = await _load_tokens(cache)
    if not tokens:
        return

    messages: list = []
    message_tokens: list[str] = []

    for token, subscribed_cats in tokens.items():
        subscribed = set(subscribed_cats)
        matched = [a for a in new_animals if _animal_categories(a) & subscribed]
        if not matched:
            continue

        count = len(matched)
        if count == 1:
            a = matched[0]
            kind = a.get("kindNm") or "동물"
            title = f"새 공고 — {kind}"
            body = f"{a.get('careNm', '보호소')}에서 새 친구가 기다려요."
        else:
            title = f"새 공고 {count}건"
            body = "관심 동물의 새 공고가 올라왔어요."

        messages.append(messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            token=token,
            android=messaging.AndroidConfig(priority="normal"),
            data={"type": "new_animal"},
        ))
        message_tokens.append(token)

    if not messages:
        return

    try:
        response = await asyncio.to_thread(messaging.send_each, messages)

        failed_tokens: list[str] = []
        for i, result in enumerate(response.responses):
            if not result.success:
                err_str = str(getattr(result.exception, "code", ""))
                if "registration-token-not-registered" in err_str or "invalid-registration-token" in err_str:
                    failed_tokens.append(message_tokens[i])
                else:
                    logger.warning(f"FCM 발송 실패 ({message_tokens[i][:12]}...): {result.exception}")

        logger.info(f"FCM 발송 완료 — 성공 {response.success_count}건 / 실패 {response.failure_count}건")

        if failed_tokens:
            updated = await _load_tokens(cache)
            for t in failed_tokens:
                updated.pop(t, None)
            await _save_tokens(cache, updated)
            logger.info(f"만료 토큰 {len(failed_tokens)}개 제거")

    except Exception as e:
        logger.error(f"FCM 배치 발송 오류: {e}")
