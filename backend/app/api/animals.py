from fastapi import APIRouter, Depends, Query, Response, HTTPException
from app.models.animal import Animal, AnimalListResponse
from app.services import animal_service
from app.dependencies import get_cache
from app.cache.manager import CacheManager

router = APIRouter(prefix="/animals", tags=["animals"])


@router.get("/by-notice/{notice_no}", response_model=Animal)
async def get_animal_by_notice_no(
    notice_no: str,
    cache: CacheManager = Depends(get_cache),
):
    animal = await animal_service.get_animal_by_notice_no(cache, notice_no)
    if not animal:
        raise HTTPException(status_code=404, detail="동물을 찾을 수 없습니다")
    return animal


@router.get("", response_model=AnimalListResponse)
async def list_animals(
    response: Response,
    sido_code: str = Query("", description="시도 코드"),
    sigungu_code: str = Query("", description="시군구 코드"),
    state: str = Query("protect", description="상태: all | protect | complete | etc"),
    species: str = Query("전체", description="종류"),
    search: str = Query("", description="텍스트 검색"),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=100),
    cache: CacheManager = Depends(get_cache),
):
    response.headers["Cache-Control"] = "public, s-maxage=3600, stale-while-revalidate=86400"
    return await animal_service.get_animals(
        cache=cache,
        sido_code=sido_code,
        sigungu_code=sigungu_code,
        state=state,
        species=species,
        search=search,
        page=page,
        per_page=per_page,
    )
