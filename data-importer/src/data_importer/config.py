from pathlib import Path

from pydantic import FilePath
from pydantic_settings import BaseSettings

DEFAULT_FILES_DIR = Path(__file__).parent.parent.parent / "data"


class Settings(BaseSettings):
    materials_json: FilePath = DEFAULT_FILES_DIR / "materials.json"
