from kedro.pipeline import node, Pipeline, pipeline  # noqa

from data_preprocessing.pipelines.gadm.nodes import (
    reshape_to_geo_region_table,
    reshape_to_admin_region_table,
    gadm_to_h3,
    join_gadm_levels_and_clean,
    add_unified_columns,
    special_cases,
)


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline(
        [
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
        ]
    )
