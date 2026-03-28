from pydantic_settings import BaseSettings
from pydantic import field_validator
import json


class Settings(BaseSettings):
    # API Keys
    API_KEY: str = ""
    DAEJEON_KEY: str = ""

    # Redis (없으면 인메모리 폴백)
    REDIS_URL: str = ""

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Cache TTL
    CACHE_TTL_ANIMALS: int = 3600   # 1시간
    CACHE_TTL_REGIONS: int = 86400  # 24시간

    # App
    ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return [v]
        return v

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
