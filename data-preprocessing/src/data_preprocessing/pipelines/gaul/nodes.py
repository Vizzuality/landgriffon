"""
This is a boilerplate pipeline 'gaul'
generated using Kedro 0.19.11
"""

import logging

import geopandas as gpd
import polars as pl
from h3ronpy import cells_to_string
from h3ronpy.pandas.vector import geoseries_to_cells


def geo_to_h3(gdf: gpd.GeoDataFrame, h3_resolution: int, tolerance: float | None) -> pl.DataFrame:
    if tolerance is not None:
        log = logging.getLogger(__name__)
        log.info("Simplifying geometries with tolerance: %s", tolerance)
        gdf["geometry"] = gdf.simplify(tolerance)
    gdf["h3_compact"] = geoseries_to_cells(gdf["geometry"], resolution=h3_resolution, compact=True)
    gdf["h3_compact"] = gdf["h3_compact"].apply(lambda arr: cells_to_string(arr).to_numpy())
    df = gdf.to_wkb(hex=True)
    return pl.DataFrame(df)
