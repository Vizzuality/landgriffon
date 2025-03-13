from kedro.pipeline import node, Pipeline, pipeline  # noqa
from data_preprocessing.pipelines.gadm.nodes import gadm_to_h3


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline(
        [
            node(gadm_to_h3, ["gadm", "params:h3_resolution"], "geo_region"),
        ]
    )
