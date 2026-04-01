import asyncio
import logging
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services import animal_service
from app.services import national_api

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="Asia/Seoul")


def setup_scheduler(cache) -> None:
    @scheduler.scheduled_job("cron", minute=0, id="cache_warming")
    async def refresh_all_caches():
        logger.info("캐시 워밍 시작")

        # 전체 시도 목록 조회
        try:
            async with httpx.AsyncClient() as client:
                sido_list = await national_api.fetch_sido(client)
        except Exception as e:
            logger.error(f"시도 목록 조회 실패: {e}")
            sido_list = []

        # 전국 + 각 시도 조합
        combinations = [("", "")] + [(s["orgCd"], "") for s in sido_list if s.get("orgCd")]

        # 동시 요청 수 제한 (API 부하 방지)
        semaphore = asyncio.Semaphore(3)

        async def warm(sido: str, sigungu: str):
            async with semaphore:
                for attempt in range(1, 3):
                    try:
                        await animal_service.get_animals(
                            cache=cache,
                            sido_code=sido,
                            sigungu_code=sigungu,
                            force_refresh=True,
                        )
                        logger.info(f"캐시 워밍 완료: sido={sido or '전국'}")
                        return
                    except Exception as e:
                        logger.warning(f"캐시 워밍 실패 (시도 {attempt}/2) sido={sido}: {e}")
                        if attempt < 2:
                            await asyncio.sleep(30)
                logger.error(f"캐시 워밍 최종 실패 sido={sido}: 재시도 소진")

        await asyncio.gather(*[warm(sido, sigungu) for sido, sigungu in combinations])
        logger.info(f"캐시 워밍 완료 — 총 {len(combinations)}개 지역")
