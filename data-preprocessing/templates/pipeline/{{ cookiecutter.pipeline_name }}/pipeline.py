"""
This is a boilerplate pipeline '{{ cookiecutter.pipeline_name }}'
generated using Kedro {{ cookiecutter.kedro_version }}
"""

from kedro.pipeline import node, Pipeline, pipeline  # noqa


preprocessing_pipeline = pipeline([], tags="preproc")

ingestion_pipeline = pipeline([], tags="ingest")


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline([preprocessing_pipeline, ingestion_pipeline])
