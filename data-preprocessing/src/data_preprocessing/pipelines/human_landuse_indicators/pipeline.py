"""
This is a boilerplate pipeline 'deforestation_by_human_lu'
generated using Kedro 0.19.12
"""

from kedro.pipeline import node, Pipeline, pipeline  # noqa

from data_preprocessing.common.pipeline import raster_pipeline


ingestion_pipeline = pipeline([], tags="ingestion")


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline(
        [
            pipeline(
                raster_pipeline,
                tags=["preprocessing", "indicator"],
                namespace="deforestation_by_human_lu",
            ),
            pipeline(
                raster_pipeline,
                tags=["preprocessing", "indicator"],
                namespace="forest_ghg_emissions",
            ),
            pipeline(
                raster_pipeline,
                tags=["preprocessing", "indicator"],
                namespace="natural_crop_conversion",
            ),
            pipeline(
                raster_pipeline,
                tags=["preprocessing", "indicator"],
                namespace="biodiversity_loss",
            ),
        ],
    )
