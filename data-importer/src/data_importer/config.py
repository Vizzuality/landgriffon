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
    materials_json: AnyUrl = AnyUrl((DEFAULT_FILES_DIR / "materials.json").as_uri())
    indicators_json: AnyUrl = AnyUrl((DEFAULT_FILES_DIR / "indicators.json").as_uri())

    # DB settings
    api_postgres_host: str = "localhost"
    api_postgres_port: int = 5432
    api_postgres_username: str = "postgres"
    api_postgres_password: SecretStr = SecretStr("")
    api_postgres_database: str = "postgres"

    # Data access settings
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    data_bucket_name: str = ""
    s3_bucket_name: str = ""

    @computed_field  # type: ignore
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
