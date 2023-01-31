from pydantic import BaseSettings
from os import getenv
from functools import lru_cache


class Settings(BaseSettings):
    api_url: str = getenv('API_HOST')
    api_port: str = getenv('API_PORT')
    s3_bucket_url: str = getenv('S3_BUCKET_URL')
    require_auth: str = getenv('REQUIRE_AUTH')


@lru_cache()
def get_settings():
    return Settings()
