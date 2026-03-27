from fastapi import APIRouter, Depends, Query
from app.models.animal import AnimalListResponse
from app.services import animal_service
from app.dependencies import get_cache
from app.cache.manager import CacheManager

router = APIRouter(prefix="/animals", tags=["animals"])


@router.get("", response_model=AnimalListResponse)
async def list_animals(
    sido_code: str = Query("", description="시도 코드"),
    sigungu_code: str = Query("", description="시군구 코드"),
    state: str = Query("protect", description="상태: all | protect | complete | etc"),
    species: str = Query("전체", description="종류"),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=100),
    cache: CacheManager = Depends(get_cache),
):
    return await animal_service.get_animals(
        cache=cache,
        sido_code=sido_code,
        sigungu_code=sigungu_code,
        state=state,
        species=species,
        page=page,
        per_page=per_page,
    )


@router.post("/refresh", response_model=AnimalListResponse)
async def refresh_animals(
    sido_code: str = Query(""),
    sigungu_code: str = Query(""),
    cache: CacheManager = Depends(get_cache),
):
    """캐시 강제 갱신"""
    return await animal_service.get_animals(
        cache=cache,
        sido_code=sido_code,
        sigungu_code=sigungu_code,
        force_refresh=True,
    )
