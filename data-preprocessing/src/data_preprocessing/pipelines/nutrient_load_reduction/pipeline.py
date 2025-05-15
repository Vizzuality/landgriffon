"""
This is a boilerplate pipeline 'nutrient_load_reduction'
generated using Kedro 0.19.12
"""

from kedro.pipeline import node, Pipeline, modular_pipeline  # noqa
from kedro.pipeline.modular_pipeline import pipeline

preprocessing_pipeline = pipeline(
    [],
    tags="preproc",
)

ingestion_pipeline = pipeline(
    [],
    tags="ingest",
)


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline([preprocessing_pipeline, ingestion_pipeline])
