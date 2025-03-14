import logging
import uuid
import re

import geopandas as gpd
import pandas as pd
from h3ronpy import cells_to_string
from h3ronpy.pandas.vector import geoseries_to_cells

log = logging.getLogger(__name__)

def _collapse_gid_and_name(row: pd.Series, remove_version: bool = True) -> tuple[str, str, int]:
    """Unify GIDs to the smallest non-null value"""
    gadm_id = row["GID_0"]
    name = row["NAME_0"]
    level = 0
    if row.get("GID_1") is not None:
        gadm_id = row["GID_1"]
        name = row["NAME_1"]
        level = 1
    if row.get("GID_2") is not None:
        gadm_id = row["GID_2"]
        name = row["NAME_2"]
        level = 2
    if row.get("GID_3") is not None:
        gadm_id = row["GID_3"]
        name = row["NAME_3"]
        level = 3
    if remove_version:
        gadm_id = re.sub(r"_\d?$", "", gadm_id)
    return gadm_id, name, level


def gadm_to_full_table(gdf: gpd.GeoDataFrame, h3_resolution: int) -> pd.DataFrame:
    log.info("Converting GADM data to H3")
    gdf["h3Compact"] = geoseries_to_cells(gdf["geometry"], resolution=h3_resolution, compact=True)
    gdf["h3Compact"] = gdf["h3Compact"].apply(lambda arr: cells_to_string(arr).to_numpy())
    log.info("Serializing geometries to WKB")
    df = gdf.to_wkb(hex=True)
    df = df.rename(columns={"geometry": "theGeom"})
    df[["gadmId", "name", "level"]] = df.apply(_collapse_gid_and_name, axis=1, result_type="expand")
    df["id"] = [str(uuid.uuid4()) for _ in range(len(df))]
    df["isoA3"] = df["GID_0"]
    return df


def reshape_to_geo_region_table(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    df["isCreatedByUser"] = False
    df = df[params["columns"]]
    return df


def reshape_to_admin_region_table(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    df = df.rename(columns={"id": "geoRegionId"})
    df["id"] = [str(uuid.uuid4()) for _ in range(len(df))]

    df["description"] = ""
    df["status"] = "active"
    df = df[params["columns"]]
    return df
