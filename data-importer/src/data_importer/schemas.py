from typing import Any

from pydantic import AnyUrl
from pydantic import BaseModel
from pydantic import RootModel

type NameCode = str


class Indicator(BaseModel):
    name_code: NameCode
    name: str
    description: str
    metadata: Any
    indicator_dataset_path: AnyUrl


class Indicators(RootModel):
    root: list[Indicator]


class Material(BaseModel):
    name_code: NameCode
    name: str
    description: str
    metadata: Any
    parent: NameCode | None
    production_dataset_path: AnyUrl  # s3://path/to/coco-production.parquet
    harvest_dataset_path: AnyUrl


class Materials(RootModel):
    root: list[Material]
