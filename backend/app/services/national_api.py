import asyncio
import logging
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

BASE_URL = "http://apis.data.go.kr/1543061/abandonmentPublicService_v2"
UPKIND_DOG = "417000"
UPKIND_CAT = "422400"
UPKIND_ETC = "429900"


def _parse_items(body: dict) -> list[dict]:
    items = body.get("items", {})
    if not items:
        return []
    item = items.get("item", [])
    if isinstance(item, dict):
        return [item]
    return item if isinstance(item, list) else []


async def _fetch_page(
    client: httpx.AsyncClient,
    upkind: str,
    sido_code: str,
    sigungu_code: str,
    page: int,
) -> dict:
    params = {k: v for k, v in {
        "serviceKey": settings.API_KEY,
        "upkind": upkind,
        "upr_cd": sido_code,
        "org_cd": sigungu_code,
        "numOfRows": 100,
        "pageNo": page,
        "_type": "json",
    }.items() if v}
    for attempt in range(3):
        try:
            r = await client.get(
                f"{BASE_URL}/abandonmentPublic_v2",
                params=params,
                timeout=20,
            )
            r.raise_for_status()
            return r.json().get("response", {}).get("body", {})
        except Exception as e:
            if attempt == 2:
                logger.warning(f"국가 API 오류 upkind={upkind} page={page}: {e}")
                return {}
            await asyncio.sleep(2 ** attempt)
    return {}


async def fetch_upkind(
    client: httpx.AsyncClient,
    upkind: str,
    sido_code: str = "",
    sigungu_code: str = "",
) -> list[dict]:
    # 첫 페이지로 totalCount 파악
    body = await _fetch_page(client, upkind, sido_code, sigungu_code, 1)
    if not body:
        return []

    total_count = int(body.get("totalCount", 0))
    items = _parse_items(body)
    total_pages = -(-total_count // 100)  # ceil division

    if total_pages > 1:
        tasks = [
            _fetch_page(client, upkind, sido_code, sigungu_code, p)
            for p in range(2, total_pages + 1)
        ]
        results = await asyncio.gather(*tasks)
        for b in results:
            items.extend(_parse_items(b))

    # upkind 필드 주입
    for item in items:
        item["upkind"] = upkind

    return items


async def fetch_all(
    sido_code: str = "",
    sigungu_code: str = "",
) -> list[dict]:
    """소동물 + 고양이 + 강아지 3종 병렬 fetch"""
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(
            fetch_upkind(client, UPKIND_ETC, sido_code, sigungu_code),
            fetch_upkind(client, UPKIND_CAT, sido_code, sigungu_code),
            fetch_upkind(client, UPKIND_DOG, sido_code, sigungu_code),
        )
    animals = []
    for items in results:
        animals.extend(items)
    return animals


async def fetch_sido(client: httpx.AsyncClient) -> list[dict]:
    params = {
        "serviceKey": settings.API_KEY,
        "numOfRows": 100,
        "_type": "json",
    }
    try:
        r = await client.get(f"{BASE_URL}/sido_v2", params=params, timeout=10)
        r.raise_for_status()
        items = r.json().get("response", {}).get("body", {}).get("items", {}).get("item", [])
        return items if isinstance(items, list) else [items]
    except Exception as e:
        logger.warning(f"시도 API 오류: {e}")
        return []


async def fetch_sigungu(client: httpx.AsyncClient, sido_code: str) -> list[dict]:
    params = {
        "serviceKey": settings.API_KEY,
        "upr_cd": sido_code,
        "numOfRows": 100,
        "_type": "json",
    }
    try:
        r = await client.get(f"{BASE_URL}/sigungu_v2", params=params, timeout=10)
        r.raise_for_status()
        items = r.json().get("response", {}).get("body", {}).get("items", {}).get("item", [])
        return items if isinstance(items, list) else [items]
    except Exception as e:
        logger.warning(f"시군구 API 오류 sido={sido_code}: {e}")
        return []
