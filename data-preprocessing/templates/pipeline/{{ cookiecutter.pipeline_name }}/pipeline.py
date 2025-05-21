"""
This is a boilerplate pipeline '{{ cookiecutter.pipeline_name }}'
generated using Kedro {{ cookiecutter.kedro_version }}
"""

from kedro.pipeline import node, Pipeline, pipeline  # noqa


preprocessing_pipeline = pipeline([], tags="preprocessing")

ingestion_pipeline = pipeline([], tags="ingestion")


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline(
        [preprocessing_pipeline, ingestion_pipeline], namespace="{{ cookiecutter.pipeline_name }}"
    )
