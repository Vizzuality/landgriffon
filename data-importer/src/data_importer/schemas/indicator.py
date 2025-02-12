from typing import Any

from pydantic import AnyUrl
from pydantic import BaseModel

type NameCode = str
type JSON = dict[str:Any]


class IndicatorMetadata(BaseModel):
    name: str
    short_name: str
    name_code: str
    indicator_type: str
    impact_type_category: str
    units: str
    description: str
    interpretation: str
    license: str
    geographic_coverage: str
    citation: list[str]
    source: list[str]
    frequency_of_updates: str
    date_of_content: str
    resolution: str


class Indicator(BaseModel):
    indicator_code: NameCode
    name: str
    description: str
    metadata: JSON
    dataset_path: AnyUrl


class Indicators(BaseModel):
    root: list[Indicator]
