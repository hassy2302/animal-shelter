from fastapi import APIRouter, Depends, HTTPException, Header, Request
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.cache.manager import CacheManager
from app.dependencies import get_cache
from app.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])
limiter = Limiter(key_func=get_remote_address)

ALLOWED_STATES = {"입양완료", "종료(입양)", "보호중"}


def verify_admin_key(x_admin_key: str = Header(...)):
    if not settings.ADMIN_KEY or x_admin_key != settings.ADMIN_KEY:
        raise HTTPException(status_code=403, detail="권한이 없습니다")


class OverrideRequest(BaseModel):
    notice_no: str
    process_state: str


@router.get("/overrides")
@limiter.limit("10/minute")
async def list_overrides(
    request: Request,
    cache: CacheManager = Depends(get_cache),
    _: None = Depends(verify_admin_key),
):
    return await cache.get_overrides()


@router.post("/override")
@limiter.limit("10/minute")
async def set_override(
    request: Request,
    body: OverrideRequest,
    cache: CacheManager = Depends(get_cache),
    _: None = Depends(verify_admin_key),
):
    if body.process_state not in ALLOWED_STATES:
        raise HTTPException(status_code=400, detail="허용되지 않는 상태값입니다")
    await cache.set_override(body.notice_no, body.process_state)
    return {"ok": True, "notice_no": body.notice_no, "process_state": body.process_state}


@router.delete("/override/{notice_no}")
@limiter.limit("10/minute")
async def delete_override(
    request: Request,
    notice_no: str,
    cache: CacheManager = Depends(get_cache),
    _: None = Depends(verify_admin_key),
):
    deleted = await cache.delete_override(notice_no)
    if not deleted:
        raise HTTPException(status_code=404, detail="오버라이드가 없습니다")
    return {"ok": True, "notice_no": notice_no}
