"""
This is a boilerplate pipeline 'nutrient_load_reduction'
generated using Kedro 0.19.12
"""

from kedro.pipeline import node, Pipeline, modular_pipeline  # noqa
from kedro.pipeline.modular_pipeline import pipeline

from data_preprocessing.pipelines.nutrient_load_reduction.nodes import geo_to_h3, load_reduction

preprocessing_pipeline = pipeline(
    [
        node(geo_to_h3, ["raw", "params:h3_resolution"], "h3_raw"),
        node(load_reduction, ["h3_raw", "params:columns"], "h3_table"),
    ],
    tags="preprocessing",
)

ingestion_pipeline = pipeline(
    [],
    tags="ingestion",
)


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline(
        [preprocessing_pipeline, ingestion_pipeline], namespace="nutrient_load_reduction"
    )
