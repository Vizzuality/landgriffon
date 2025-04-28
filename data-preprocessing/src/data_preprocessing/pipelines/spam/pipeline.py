"""
This is a boilerplate pipeline 'spam'
generated using Kedro 0.19.12
"""

from kedro.pipeline import node, Pipeline, pipeline  # noqa

from data_preprocessing.pipelines.spam.nodes import parts_to_h3s


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline([node(parts_to_h3s, "spam_production", "spam_production#h3")])
