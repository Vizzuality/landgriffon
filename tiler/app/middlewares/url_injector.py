from fastapi.params import Query

from ..config.config import get_settings


def inject_s3_url(url: str | None = Query(default=None, description="Optional dataset URL")) -> str:
    s3_url = get_settings().s3_bucket_url
    return s3_url + url
