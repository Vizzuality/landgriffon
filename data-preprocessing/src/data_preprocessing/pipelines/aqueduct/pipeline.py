"""
This is a boilerplate pipeline 'aqueduct'
generated using Kedro 0.19.12
"""

from kedro.pipeline import node, Pipeline, pipeline  # noqa


preprocessing_pipeline = pipeline([], tags="preproc")

ingestion_pipeline = pipeline([], tags="ingest")


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline([preprocessing_pipeline, ingestion_pipeline])
