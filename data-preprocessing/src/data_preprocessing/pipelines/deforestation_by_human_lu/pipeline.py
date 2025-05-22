"""
This is a boilerplate pipeline 'deforestation_by_human_lu'
generated using Kedro 0.19.12
"""

from kedro.pipeline import node, Pipeline, pipeline  # noqa

from data_preprocessing.generic.pipeline import raster_pipeline

preprocessing_pipeline = pipeline(raster_pipeline, tags="preprocessing")

ingestion_pipeline = pipeline([], tags="ingestion")


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline(
        [preprocessing_pipeline, ingestion_pipeline], namespace="deforestation_by_human_lu"
    )
