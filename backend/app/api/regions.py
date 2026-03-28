import httpx
from fastapi import APIRouter, Depends, Query
from app.models.region import Sido, Sigungu
from app.services import national_api
from app.dependencies import get_cache
from app.cache.manager import CacheManager
from app.config import settings

router = APIRouter(prefix="/regions", tags=["regions"])


@router.get("/sido", response_model=list[Sido])
async def list_sido(cache: CacheManager = Depends(get_cache)):
    key = CacheManager.sido_key()
    cached = await cache.get(key)
    if cached:
        return [Sido(**s) for s in cached]

    async with httpx.AsyncClient() as client:
        raw = await national_api.fetch_sido(client)

    result = []
    for item in raw:
        name = item.get("orgdownNm") or item.get("orgNm") or ""
        code = item.get("orgCd") or item.get("sidoCd") or ""
        if name and code:
            result.append(Sido(name=name, code=code))

    await cache.set(key, [s.model_dump() for s in result], settings.CACHE_TTL_REGIONS)
    return result


@router.get("/sigungu", response_model=list[Sigungu])
async def list_sigungu(
    sido_code: str = Query(..., description="시도 코드"),
    cache: CacheManager = Depends(get_cache),
):
    key = CacheManager.sigungu_key(sido_code)
    cached = await cache.get(key)
    if cached:
        return [Sigungu(**s) for s in cached]

    async with httpx.AsyncClient() as client:
        raw = await national_api.fetch_sigungu(client, sido_code)

    _SIDO_SUFFIXES = ("특별시", "광역시", "특별자치시", "특별자치도", "도")
    result = []
    for item in raw:
        name = item.get("orgdownNm") or item.get("orgNm") or ""
        code = item.get("orgCd") or item.get("sigunguCd") or ""
        if name and code and code != sido_code and not name.endswith(_SIDO_SUFFIXES):
            result.append(Sigungu(name=name, code=code))

    # 가정보호 추가
    if len(sido_code) >= 3:
        result.append(Sigungu(name="가정보호", code=sido_code[:3] + "9999"))

    await cache.set(key, [s.model_dump() for s in result], settings.CACHE_TTL_REGIONS)
    return result
