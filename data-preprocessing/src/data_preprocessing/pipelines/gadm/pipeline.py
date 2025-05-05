from kedro.pipeline import Pipeline, node, pipeline

from data_preprocessing.pipelines.gadm.nodes import (
    add_unified_columns,
    gadm_to_h3,
    ingest_admin_region,
    join_gadm_levels_and_clean,
    reshape_to_admin_region_table,
    reshape_to_geo_region_table,
    special_cases,
)

base_pipe = [
    node(
        gadm_to_h3,
        ["gadm_adm0", "params:h3_resolution", "params:adm0.tolerance"],
        "gadm_adm0_h3",
    ),
    node(
        gadm_to_h3,
        ["gadm_adm1", "params:h3_resolution", "params:adm1.tolerance"],
        "gadm_adm1_h3",
    ),
    node(
        gadm_to_h3,
        ["gadm_adm2", "params:h3_resolution", "params:adm2.tolerance"],
        "gadm_adm2_h3",
    ),
    node(
        join_gadm_levels_and_clean,
        ["gadm_adm0_h3", "gadm_adm1_h3", "gadm_adm2_h3"],
        "gadm_h3_all_levels",
    ),
    node(
        special_cases,
        "gadm_h3_all_levels",
        "gadm_h3_all_clean",
    ),
    node(
        add_unified_columns,
        "gadm_h3_all_clean",
        "gadm_h3_all_uni",
    ),
    node(
        reshape_to_geo_region_table,
        ["gadm_h3_all_uni", "params:geo_region"],
        "geo_regions",
    ),
    node(
        reshape_to_admin_region_table,
        ["gadm_h3_all_uni", "params:admin_region"],
        "admin_regions",
    ),
    # ====== INGESTION =======
    node(
        ingest_admin_region,
        "admin_regions",
        None,
        tags="ingest",
    ),
]


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline(base_pipe, tags="core")  # type: ignore
