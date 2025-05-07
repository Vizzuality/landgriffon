from typing import Any

from pydantic import UUID4, RootModel

from data_preprocessing.models.common import CamelCaseModel

type NameCode = str


class MaterialItem(CamelCaseModel):
    # id: UUID4
    parent_id: UUID4 | None
    name: str
    description: str
    hs_code_id: str
    # earthstat_id: str | None
    # mapspam_id: str | None
    # status: Literal["active", "inactive"]
    metadata: dict[str, Any] | None
    dataset_id: str | None
    mpath: str


class Materials(RootModel):
    root: list[MaterialItem]
