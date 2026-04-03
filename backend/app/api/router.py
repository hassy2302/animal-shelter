from fastapi import APIRouter
from app.api import animals, regions, admin

router = APIRouter()
router.include_router(animals.router)
router.include_router(regions.router)
router.include_router(admin.router)
