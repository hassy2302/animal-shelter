import asyncio
import base64
import logging
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

CLASSIFY_PROMPT = """이 이미지에 있는 동물의 종류를 아래 목록 중 하나로만 답하세요. 반드시 목록에 있는 단어 하나만 답하세요.

햄스터, 기니피그, 다람쥐, 페럿, 토끼, 고슴도치, 거북이, 뱀, 도마뱀, 앵무새, 기타새, 물고기, 기타

동물이 보이지 않거나 확실하지 않으면 기타로 답하세요."""

VALID_LABELS = {
    "햄스터", "기니피그", "다람쥐", "페럿", "토끼",
    "고슴도치", "거북이", "뱀", "도마뱀", "앵무새", "기타새", "물고기", "기타",
}

# AI 분류 결과 → 프론트엔드 species 필터 매핑
AI_SPECIES_MAP = {
    "햄스터": "🐹 햄스터",
    "토끼":   "🐰 토끼",
    "거북이": "🐢 거북이",
    "고슴도치": "🦔 고슴도치",
    "앵무새": "🐦 새",
    "기타새": "🐦 새",
}

CLASSIFY_CACHE_TTL = 604800  # 7일

_semaphore: asyncio.Semaphore | None = None

# 무료 티어: 분당 15건 제한 → 요청 간 5초 간격 (12 RPM)
_REQUEST_INTERVAL = 5.0


def _get_semaphore() -> asyncio.Semaphore:
    global _semaphore
    if _semaphore is None:
        _semaphore = asyncio.Semaphore(1)
    return _semaphore


async def classify_image(image_url: str) -> str:
    """이미지 URL을 Gemini Vision으로 분류하여 동물 종류 반환."""
    if not settings.GEMINI_API_KEY:
        return "기타"

    async with _get_semaphore():
        await asyncio.sleep(_REQUEST_INTERVAL)
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                img_resp = await client.get(image_url, follow_redirects=True, timeout=10)
                if img_resp.status_code != 200:
                    return "기타"

                image_data = base64.b64encode(img_resp.content).decode()
                mime_type = img_resp.headers.get("content-type", "image/jpeg").split(";")[0]

                payload = {
                    "contents": [{
                        "parts": [
                            {"inline_data": {"mime_type": mime_type, "data": image_data}},
                            {"text": CLASSIFY_PROMPT},
                        ]
                    }],
                    "generationConfig": {"maxOutputTokens": 10, "temperature": 0},
                }

                resp = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}",
                    json=payload,
                    timeout=20,
                )

                if resp.status_code == 429:
                    logger.warning("Gemini 429 - 30초 대기 후 재시도")
                    await asyncio.sleep(30)
                    resp = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}",
                        json=payload,
                        timeout=20,
                    )
                if resp.status_code != 200:
                    logger.warning(f"Gemini API 오류: {resp.status_code} {resp.text[:200]}")
                    return "기타"

                text = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                for label in VALID_LABELS:
                    if label in text:
                        return label
                return "기타"

        except Exception as e:
            logger.warning(f"이미지 분류 실패 ({image_url[:60]}): {e}")
            return "기타"
