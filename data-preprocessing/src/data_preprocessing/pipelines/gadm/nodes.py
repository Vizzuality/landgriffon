import logging
import uuid

import geopandas as gpd
import pandas as pd
from h3ronpy import cells_to_string
from h3ronpy.pandas.vector import geoseries_to_cells

log = logging.getLogger(__name__)


def gadm_to_h3(gdf: gpd.GeoDataFrame, h3_resolution: int) -> pd.DataFrame:
    log.info("Converting GADM data to H3")
    gdf["h3Compact"] = geoseries_to_cells(gdf["geometry"], resolution=h3_resolution, compact=True)
    log.info("Converting H3 cells to hex strings")
    gdf["h3Compact"] = gdf["h3Compact"].apply(lambda arr: cells_to_string(arr).to_numpy())
    # # convert h3 lists to sql literal arrays
    # gdf["h3Compact"] = gdf["h3Compact"].apply(lambda x: f"{{{','.join(e for e in x)}}}")

    log.info("Serializing geometries to WKB")
    df = gdf.to_wkb(hex=True)
    df = df.rename(columns={"geometry": "theGeom"})

    df["id"] = [str(uuid.uuid4()) for _ in range(len(df))]
    return df


def reshape_to_geo_region_table(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    df["isCreatedByUser"] = False
    df = df[params["columns"]]
    return df


def reshape_to_admin_region_table(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    df = df[params["columns"]]
    return df
