"""
This is a boilerplate pipeline 'spam'
generated using Kedro 0.19.12
"""

from kedro.pipeline import node, Pipeline, pipeline  # noqa

from data_preprocessing.pipelines.spam.nodes import parts_to_h3_tables, combinations, join_h3_table

preprocessing_pipeline = pipeline(
    # TODO: Use namespaces to reuse pipeline instead of duplicating it for harvest and production
    [
        # Production
        node(
            parts_to_h3_tables,
            ["spam_production", "params:h3_resolution"],
            "spam_production_h3_parts",
        ),
        node(join_h3_table, "spam_production_h3_parts", "spam_production_h3_raw"),
        node(
            combinations,
            ["spam_production_h3_raw", "params:combinations_prod"],
            "spam_production_h3",
        ),
        # Harvest
        node(parts_to_h3_tables, ["spam_ha", "params:h3_resolution"], "spam_ha_h3_parts"),
        node(join_h3_table, "spam_ha_h3_parts", "spam_ha_h3_raw"),
        node(combinations, ["spam_ha_h3_raw", "params:combinations_ha"], "spam_ha_h3"),
    ],
    tags="preproc",
)

ingestion_pipeline = pipeline(
    [],
    tags="ingest",
)


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline([preprocessing_pipeline, ingestion_pipeline])
