from typing import Any, Literal

from pydantic import UUID4, BaseModel, ConfigDict, RootModel
from pydantic.alias_generators import to_camel

type NameCode = str


class MaterialItem(BaseModel):
    model_config = ConfigDict(
        # Remember it must use by_alias=True parameter when serialization to get camelCase json.
        alias_generator=to_camel,
        # https://docs.pydantic.dev/latest/api/config/#pydantic.config.ConfigDict.validate_by_alias
        validate_by_alias=True,
        validate_by_name=True,
    )
    id: UUID4
    parent_id: UUID4 | None
    name: str
    description: str
    hs_code_id: str
    earthstat_id: str | None
    mapspam_id: str | None
    status: Literal["active", "inactive"]
    metadata: dict[str, Any] | None
    dataset_id: str | None
    mpath: str


class Materials(RootModel):
    root: list[MaterialItem]
