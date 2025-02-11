from pydantic import FilePath
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    materials_json: FilePath
