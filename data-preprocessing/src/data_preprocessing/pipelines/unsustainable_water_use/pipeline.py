"""
This is a boilerplate pipeline 'unsustainable_water_use'
generated using Kedro 0.19.12
"""

from kedro.pipeline import Pipeline, node, pipeline

from data_preprocessing.pipelines.unsustainable_water_use.nodes import (
    excess_withdrawals,
    filter_columns,
    geo_to_h3,
)

preprocessing_pipeline = pipeline(  # type: ignore
    [
        node(filter_columns, ["aqueduct", "params:columns"], "aqueduct_filtered"),
        node(geo_to_h3, ["aqueduct_filtered", "params:h3_resolution"], "aqueduct_h3"),
        node(
            excess_withdrawals,
            [
                "aqueduct_h3",
                "params:columns.stress_category",
                "params:columns.stress_value",
                "params:columns.excess_withdrawals",
            ],
            "excess_withdrawals_h3",
        ),
    ],
    tags="preproc",
)

ingestion_pipeline = pipeline(  # type: ignore
    [], tags="ingest"
)


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline([preprocessing_pipeline, ingestion_pipeline])  # type: ignore
