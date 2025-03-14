from kedro.pipeline import node, Pipeline, pipeline  # noqa
from data_preprocessing.pipelines.gadm.nodes import gadm_to_full_table, reshape_to_geo_region_table, \
    reshape_to_admin_region_table


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline(
        [
            node(gadm_to_full_table, ["gadm", "params:h3_resolution"], "gadm_h3"),
            node(reshape_to_geo_region_table, ["gadm_h3", "params:geo_region"], "geo_regions"),
            node(reshape_to_admin_region_table, ["gadm_h3", "params:admin_region"], "admin_regions")
        ]
    )
