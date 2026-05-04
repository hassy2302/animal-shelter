import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services import animal_service
from app.cache.manager import CacheManager

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="Asia/Seoul")


def setup_scheduler(cache) -> None:
    @scheduler.scheduled_job("cron", minute=0, id="cache_warming")
    async def refresh_all_caches():
        logger.info("캐시 워밍 시작")

        # 전국 단일 워밍만 (시도별 워밍 제거 — 메모리 과부하 방지)
        for attempt in range(1, 3):
            try:
                await animal_service.get_animals(
                    cache=cache,
                    sido_code="",
                    sigungu_code="",
                    force_refresh=True,
                )
                logger.info("캐시 워밍 완료: 전국")
                break
            except Exception as e:
                logger.warning(f"캐시 워밍 실패 (시도 {attempt}/2): {e}")
                if attempt < 2:
                    await asyncio.sleep(30)
        else:
            logger.error("캐시 워밍 최종 실패: 재시도 소진")

