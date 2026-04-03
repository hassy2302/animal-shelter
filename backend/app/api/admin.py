from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from app.cache.manager import CacheManager
from app.dependencies import get_cache
from app.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])


def verify_admin_key(x_admin_key: str = Header(...)):
    if not settings.ADMIN_KEY or x_admin_key != settings.ADMIN_KEY:
        raise HTTPException(status_code=403, detail="권한이 없습니다")


class OverrideRequest(BaseModel):
    notice_no: str
    process_state: str


@router.get("/overrides")
async def list_overrides(
    cache: CacheManager = Depends(get_cache),
    _: None = Depends(verify_admin_key),
):
    return await cache.get_overrides()


@router.post("/override")
async def set_override(
    body: OverrideRequest,
    cache: CacheManager = Depends(get_cache),
    _: None = Depends(verify_admin_key),
):
    await cache.set_override(body.notice_no, body.process_state)
    return {"ok": True, "notice_no": body.notice_no, "process_state": body.process_state}


@router.delete("/override/{notice_no}")
async def delete_override(
    notice_no: str,
    cache: CacheManager = Depends(get_cache),
    _: None = Depends(verify_admin_key),
):
    deleted = await cache.delete_override(notice_no)
    if not deleted:
        raise HTTPException(status_code=404, detail="오버라이드가 없습니다")
    return {"ok": True, "notice_no": notice_no}
