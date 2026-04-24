from fastapi import APIRouter, Depends, HTTPException, Header, Request
from pydantic import BaseModel
from app.cache.manager import CacheManager
from app.dependencies import get_cache
from app.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])

ALLOWED_STATES = {"입양완료", "보호중"}
_MAX_FAILURES = 5
_LOCKOUT_TTL = 600  # 10분


async def verify_admin(
    request: Request,
    x_admin_key: str = Header(...),
    cache: CacheManager = Depends(get_cache),
):
    ip = request.client.host if request.client else "unknown"
    lockout_key = f"admin:lockout:{ip}"
    fail_key = f"admin:fail:{ip}"

    if await cache.get(lockout_key):
        raise HTTPException(status_code=429, detail="너무 많은 실패 시도입니다. 10분 후 다시 시도해주세요.")

    if not settings.ADMIN_KEY or x_admin_key != settings.ADMIN_KEY:
        count = (await cache.get(fail_key) or 0) + 1
        if count >= _MAX_FAILURES:
            await cache.set(lockout_key, True, ttl=_LOCKOUT_TTL)
            await cache.delete(fail_key)
            raise HTTPException(status_code=429, detail="너무 많은 실패 시도입니다. 10분 후 다시 시도해주세요.")
        await cache.set(fail_key, count, ttl=_LOCKOUT_TTL)
        raise HTTPException(status_code=403, detail="권한이 없습니다")

    await cache.delete(fail_key)


class OverrideRequest(BaseModel):
    notice_no: str
    process_state: str


@router.get("/overrides")
async def list_overrides(
    cache: CacheManager = Depends(get_cache),
    _: None = Depends(verify_admin),
):
    return await cache.get_overrides()


@router.post("/override")
async def set_override(
    body: OverrideRequest,
    cache: CacheManager = Depends(get_cache),
    _: None = Depends(verify_admin),
):
    if body.process_state not in ALLOWED_STATES:
        raise HTTPException(status_code=400, detail="허용되지 않는 상태값입니다")
    await cache.set_override(body.notice_no, body.process_state)
    return {"ok": True, "notice_no": body.notice_no, "process_state": body.process_state}


@router.delete("/override/{notice_no}")
async def delete_override(
    notice_no: str,
    cache: CacheManager = Depends(get_cache),
    _: None = Depends(verify_admin),
):
    deleted = await cache.delete_override(notice_no)
    if not deleted:
        raise HTTPException(status_code=404, detail="오버라이드가 없습니다")
    return {"ok": True, "notice_no": notice_no}
