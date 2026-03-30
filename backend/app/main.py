import logging
from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.cache.manager import CacheManager
from app.dependencies import set_cache
from app.api.router import router
from app.scheduler.jobs import scheduler, setup_scheduler
from app.services import animal_service

logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    cache = CacheManager(settings.REDIS_URL)
    await cache.connect()
    set_cache(cache)

    # 스케줄러 설정 및 시작
    setup_scheduler(cache)
    scheduler.start()

    # 초기 캐시 워밍 (백그라운드)
    async def warm():
        await asyncio.sleep(2)
        logger.info("초기 캐시 워밍 시작")
        try:
            await animal_service.get_animals(cache=cache, force_refresh=True)
        except Exception as e:
            logger.warning(f"초기 캐시 워밍 실패: {e}")

    asyncio.create_task(warm())

    yield

    # Shutdown
    scheduler.shutdown()
    await cache.close()


app = FastAPI(
    title="유기동물 입양 공고 API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    return {"status": "ok"}
