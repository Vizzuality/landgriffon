from typing import Any

from pydantic import AnyUrl, BaseModel, RootModel

type NameCode = str


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
