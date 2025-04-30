from typing import Any

from pydantic import AnyUrl, BaseModel, RootModel

type NameCode = str


class Indicator(BaseModel):
    name_code: NameCode
    name: str
    description: str
    metadata: Any
    indicator_dataset_path: AnyUrl


class Indicators(RootModel):
    root: list[Indicator]
