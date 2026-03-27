import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services import animal_service

logger = logging.getLogger(__name__)

# 미리 워밍할 시도/시군구 조합
PRELOAD_COMBINATIONS = [
    ("", ""),         # 전국 전체
    ("6110000", ""),  # 서울
    ("6300000", ""),  # 대전
]

scheduler = AsyncIOScheduler(timezone="Asia/Seoul")


def setup_scheduler(cache) -> None:
    @scheduler.scheduled_job("cron", minute=0, id="cache_warming")
    async def refresh_popular_caches():
        logger.info("캐시 워밍 시작")
        for sido, sigungu in PRELOAD_COMBINATIONS:
            try:
                await animal_service.get_animals(
                    cache=cache,
                    sido_code=sido,
                    sigungu_code=sigungu,
                    force_refresh=True,
                )
                logger.info(f"캐시 워밍 완료: sido={sido or '전국'}")
            except Exception as e:
                logger.error(f"캐시 워밍 실패 sido={sido}: {e}")
