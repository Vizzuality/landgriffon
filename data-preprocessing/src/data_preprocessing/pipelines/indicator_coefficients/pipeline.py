"""
This is a boilerplate pipeline 'indicator_coeffiecients'
generated using Kedro 0.19.13
"""

from kedro.pipeline import node, Pipeline, pipeline  # noqa

from data_preprocessing.pipelines.indicator_coefficients.nodes import complete_table_with_relations

preprocessing_pipeline = pipeline(
    [],
    tags="preprocessing",
)

ingestion_pipeline = pipeline(
    [
        node(
            complete_table_with_relations,
            ["material", "admin_region", "blue_water#csv"],
            "blue_water_table",
        )
    ],
    tags="ingestion",
)


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline(
        [preprocessing_pipeline, ingestion_pipeline], namespace="indicator_coefficients"
    )
