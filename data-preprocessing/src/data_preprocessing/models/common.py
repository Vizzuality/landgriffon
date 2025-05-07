from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelCaseModel(BaseModel):
    model_config = ConfigDict(
        # Remember it must use by_alias=True parameter when serialization to get camelCase json.
        alias_generator=to_camel,
        # https://docs.pydantic.dev/latest/api/config/#pydantic.config.ConfigDict.validate_by_alias
        validate_by_alias=True,
        validate_by_name=True,
    )
