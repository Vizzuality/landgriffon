"""
This is a boilerplate pipeline 'spam'
generated using Kedro 0.19.12
"""

from kedro.pipeline import Pipeline, node, pipeline

from data_preprocessing.pipelines.spam.nodes import combinations, join_h3_table, parts_to_h3_tables

preprocessing_pipeline = pipeline(  # type: ignore
    [
        # ---- Production ----
        node(
            parts_to_h3_tables,
            ["production", "params:h3_resolution"],
            "production_h3_parts",
        ),
        node(join_h3_table, "production_h3_parts", "production_h3_raw"),
        node(
            combinations,
            ["production_h3_raw", "params:combinations_prod"],
            "production_h3",
        ),
        # ---- Harvest ----
        node(parts_to_h3_tables, ["harvest", "params:h3_resolution"], "ha_h3_parts"),
        node(join_h3_table, "ha_h3_parts", "ha_h3_raw"),
        node(combinations, ["ha_h3_raw", "params:combinations_ha"], "ha_h3"),
    ],
    tags="preprocessing",
)

ingestion_pipeline = pipeline(
    [],
    tags="ingestion",
)


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline([preprocessing_pipeline, ingestion_pipeline], namespace="spam")
