"""
This is a boilerplate pipeline 'gaul'
generated using Kedro 0.19.11
"""

from kedro.pipeline import node, Pipeline, pipeline  # noqa

from data_preprocessing.pipelines.gaul.nodes import geo_to_h3


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline([node(geo_to_h3, ["gaul_l2", "params:h3_resolution"], "gaul_l2_h3")])
