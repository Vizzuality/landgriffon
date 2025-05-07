from typing import Any

from pydantic import AnyUrl, RootModel

from data_preprocessing.models.common import CamelCaseModel

type NameCode = str


class Indicator(CamelCaseModel):
    name_code: NameCode
    name: str
    description: str
    metadata: Any
    indicator_dataset_path: AnyUrl


class Indicators(RootModel):
    root: list[Indicator]
