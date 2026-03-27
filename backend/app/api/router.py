from fastapi import APIRouter
from app.api import animals, regions

router = APIRouter()
router.include_router(animals.router)
router.include_router(regions.router)
