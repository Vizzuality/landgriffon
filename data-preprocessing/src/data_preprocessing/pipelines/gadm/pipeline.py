from kedro.pipeline import Pipeline, node, pipeline

from data_preprocessing.pipelines.gadm.nodes import (
    add_unified_columns,
    gadm_to_h3,
    join_gadm_levels_and_clean,
    reshape_to_admin_region_table,
    reshape_to_geo_region_table,
    special_cases,
)

preprocessing_pipeline = pipeline(
    [
        node(
            gadm_to_h3,
            ["adm0", "params:h3_resolution", "params:adm0.tolerance"],
            "adm0_h3",
        ),
        node(
            gadm_to_h3,
            ["adm1", "params:h3_resolution", "params:adm1.tolerance"],
            "adm1_h3",
        ),
        node(
            gadm_to_h3,
            ["adm2", "params:h3_resolution", "params:adm2.tolerance"],
            "adm2_h3",
        ),
        node(
            join_gadm_levels_and_clean,
            ["adm0_h3", "adm1_h3", "adm2_h3"],
            "h3_all_levels",
        ),
        node(
            special_cases,
            "h3_all_levels",
            "h3_all_clean",
        ),
        node(
            add_unified_columns,
            "h3_all_clean",
            "h3_all_uni",
        ),
        node(
            reshape_to_geo_region_table,
            ["h3_all_uni", "params:geo_region"],
            "geo_region",
        ),
        node(
            reshape_to_admin_region_table,
            ["h3_all_uni", "params:admin_region"],
            "admin_region",
        ),
    ],
    tags="preprocessing",
)

ingestion_pipeline = pipeline(
    [
        node(
            lambda x: x.to_pandas(),
            "admin_region",
            "admin_region_db",
        ),
    ],
    tags="ingestion",
)


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline(
        preprocessing_pipeline + ingestion_pipeline,
        tags="core",
        namespace="gadm",
        outputs={"admin_region_db": "admin_region_db@pandas"},
    )  # type: ignore
