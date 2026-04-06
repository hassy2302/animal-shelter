from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.dependencies import get_cache
from app.cache.manager import CacheManager
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


class TokenBody(BaseModel):
    token: str
    categories: list[str] = []


class UnregisterBody(BaseModel):
    token: str


@router.post("/register")
async def register(body: TokenBody, cache: CacheManager = Depends(get_cache)):
    """FCM 토큰 및 카테고리 구독 등록"""
    await notification_service.register_token(cache, body.token, body.categories)
    return {"ok": True}


@router.put("/preferences")
async def update_preferences(body: TokenBody, cache: CacheManager = Depends(get_cache)):
    """카테고리 구독 업데이트"""
    await notification_service.register_token(cache, body.token, body.categories)
    return {"ok": True}


@router.delete("/unregister")
async def unregister(body: UnregisterBody, cache: CacheManager = Depends(get_cache)):
    """FCM 토큰 등록 해제"""
    await notification_service.unregister_token(cache, body.token)
    return {"ok": True}
