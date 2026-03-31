import asyncio
import time
import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


class InMemoryCache:
    """Redis 없을 때 사용하는 인메모리 TTL 캐시"""

    def __init__(self):
        self._store: dict[str, tuple[Any, float]] = {}  # key → (value, expire_at)
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Any | None:
        async with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            value, expire_at = entry
            if time.time() > expire_at:
                del self._store[key]
                return None
            return value

    async def set(self, key: str, value: Any, ttl: int) -> None:
        async with self._lock:
            self._store[key] = (value, time.time() + ttl)

    async def delete(self, key: str) -> None:
        async with self._lock:
            self._store.pop(key, None)

    async def close(self) -> None:
        pass


class CacheManager:
    def __init__(self, redis_url: str = ""):
        self._redis = None
        self._fallback = InMemoryCache()
        self._redis_url = redis_url

    async def connect(self) -> None:
        if not self._redis_url:
            logger.info("Redis URL 없음 — 인메모리 캐시 사용")
            return
        try:
            import redis.asyncio as aioredis
            self._redis = aioredis.from_url(
                self._redis_url,
                decode_responses=True,
                ssl_cert_reqs=None,
            )
            await self._redis.ping()
            logger.info("Redis 연결 성공")
        except Exception as e:
            logger.warning(f"Redis 연결 실패 ({e}) — 인메모리 캐시로 폴백")
            self._redis = None

    async def close(self) -> None:
        if self._redis:
            await self._redis.close()

    async def get(self, key: str) -> Any | None:
        if self._redis:
            try:
                raw = await self._redis.get(key)
                return json.loads(raw) if raw else None
            except Exception:
                pass
        return await self._fallback.get(key)

    async def set(self, key: str, value: Any, ttl: int) -> None:
        if self._redis:
            try:
                await self._redis.setex(key, ttl, json.dumps(value, default=str))
                return
            except Exception:
                pass
        await self._fallback.set(key, value, ttl)

    async def delete(self, key: str) -> None:
        if self._redis:
            try:
                await self._redis.delete(key)
            except Exception:
                pass
        await self._fallback.delete(key)

    @staticmethod
    def animals_key(sido: str, sigungu: str) -> str:
        return f"animals:{sido or 'all'}:{sigungu or 'all'}"

    @staticmethod
    def sido_key() -> str:
        return "sido_list"

    @staticmethod
    def sigungu_key(sido: str) -> str:
        return f"sigungu:{sido}"
