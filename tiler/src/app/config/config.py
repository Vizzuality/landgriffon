from functools import lru_cache

from pydantic_settings import BaseSettings
from pydantic_settings.main import SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # `.env` takes priority over `.env.default`
        env_file=(".env.default", ".env")
    )

    api_url: str
    api_port: str
    s3_bucket_name: str
    require_auth: str
    root_path: str
    titiler_prefix: str
    titiler_router_prefix: str
    default_cog: str


@lru_cache
def get_settings():
    return Settings()
