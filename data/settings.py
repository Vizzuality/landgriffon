from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra='ignore', env_file='../.env')
    """Global settings for all things data"""

    # DB settings
    api_postgres_host: str
    api_postgres_port: int
    api_postgres_username: str
    api_postgres_password: str
    api_postgres_database: str

    # Data access settings
    aws_access_key_id: str
    aws_secret_access_key: str
    data_bucket_name: str
    s3_bucket_name: str

    indicator_coefficient_config: str


settings = Settings()
