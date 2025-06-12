"""
This is a boilerplate pipeline 'indicator_coeffiecients'
generated using Kedro 0.19.13
"""

from kedro.pipeline import node, Pipeline, pipeline  # noqa


preprocessing_pipeline = pipeline([], tags="preprocessing")

ingestion_pipeline = pipeline([], tags="ingestion")


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline(
        [preprocessing_pipeline, ingestion_pipeline], namespace="indicator_coeffiecients"
    )
