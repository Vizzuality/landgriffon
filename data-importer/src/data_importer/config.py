from pathlib import Path
from urllib.parse import quote

from pydantic import AnyUrl
from pydantic import PostgresDsn
from pydantic import SecretStr
from pydantic import computed_field
from pydantic_settings import BaseSettings
from pydantic_settings import SettingsConfigDict

DEFAULT_FILES_DIR = Path(__file__).parent.parent.parent / "data"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore", env_file="../.env")

    # Base import configurations
    materials_json: AnyUrl = (DEFAULT_FILES_DIR / "materials.json").as_uri()
    indicators_json: AnyUrl = (DEFAULT_FILES_DIR / "indicators.json").as_uri()

    # DB settings
    api_postgres_host: str
    api_postgres_port: int
    api_postgres_username: str
    api_postgres_password: SecretStr
    api_postgres_database: str

    # Data access settings
    aws_access_key_id: str
    aws_secret_access_key: str
    data_bucket_name: str
    s3_bucket_name: str

    indicator_coefficient_config: str

    @computed_field
    @property
    def database_uri(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql",
            username=quote(self.api_postgres_username),
            password=quote(self.api_postgres_password.get_secret_value()),
            host=self.api_postgres_host,
            port=self.api_postgres_port,
            path=self.api_postgres_database,
        )


settings = Settings()
