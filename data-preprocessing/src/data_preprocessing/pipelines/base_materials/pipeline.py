"""
This is a boilerplate pipeline 'base_materials'
generated using Kedro 0.19.12
"""

from kedro.pipeline import node, Pipeline, pipeline  # noqa

from data_preprocessing.pipelines.base_materials.nodes import to_table


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline(
        [
            node(to_table, "materials", "materials_db"),
        ]
    )  # type: ignore
