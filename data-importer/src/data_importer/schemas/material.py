from typing import Any

from pydantic import AnyUrl
from pydantic import BaseModel

type NameCode = str
type JSON = dict[str:Any]


class MaterialMetadata(BaseModel):
    name: str
    resolution: str
    geographic_coverage: str
    source: str
    datasets: list[str]
    frequency_of_updates: str | None
    date_of_content: str
    cautions: str
    license: str
    overview: str
    citation: str


class Material(BaseModel):
    material_code: NameCode
    name: str
    description: str
    metadata: MaterialMetadata
    parent: NameCode | None
    production_dataset_path: AnyUrl  # s3://path/to/coco-production.parquet
    harvest_dataset_path: AnyUrl


class Materials:
    root: list[Material]
