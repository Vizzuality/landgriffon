from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelCaseModel(BaseModel):
    """Model that allows writing python models in snake case that
    serializes to the camelCase expected by the other parts of the
    Landgriffon system.
    """

    model_config = ConfigDict(
        # Must use by_alias=True parameter when serialization to get camelCase json.
        alias_generator=to_camel,
        # https://docs.pydantic.dev/latest/api/config/#pydantic.config.ConfigDict.validate_by_alias
        validate_by_alias=True,
        validate_by_name=True,
    )
