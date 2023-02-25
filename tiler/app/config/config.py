from pydantic import BaseSettings
from os import getenv
from functools import lru_cache


class Settings(BaseSettings):
    api_url: str = getenv('API_HOST')
    api_port: str = getenv('API_PORT')
    s3_bucket_name: str = getenv('S3_BUCKET_NAME')
    require_auth: str = getenv('REQUIRE_AUTH')
    root_path: str = getenv("ROOT_PATH")
    titiler_prefix: str = getenv("TITILER_PREFIX")
    titiler_router_prefix: str = getenv("TITILER_ROUTER_PREFIX")
    default_cog: str = getenv("DEFAULT_COG")

@lru_cache()
def get_settings():
    return Settings()
