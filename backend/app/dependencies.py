from app.cache.manager import CacheManager

_cache: CacheManager | None = None


def set_cache(cache: CacheManager) -> None:
    global _cache
    _cache = cache


def get_cache() -> CacheManager:
    if _cache is None:
        raise RuntimeError("캐시가 초기화되지 않았습니다")
    return _cache
