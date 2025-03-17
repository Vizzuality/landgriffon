import logging
import re
import uuid

import geopandas as gpd
import pandas as pd
import polars as pl
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


def gadm_to_h3(gdf: gpd.GeoDataFrame, h3_resolution: int, tolerance: float | None) -> pl.DataFrame:
    if tolerance is not None:
        log.info("Simplifying geometries with tolerance: %s", tolerance)
        gdf["geometry"] = gdf.simplify(tolerance)
    gdf["h3Compact"] = geoseries_to_cells(gdf["geometry"], resolution=h3_resolution, compact=True)
    gdf["h3Compact"] = gdf["h3Compact"].apply(lambda arr: cells_to_string(arr).to_numpy())
    df = gdf.to_wkb(hex=True)
    return pl.DataFrame(df)


def join_gadm_levels(adm0: pl.DataFrame, adm1: pl.DataFrame, adm2: pl.DataFrame) -> pl.DataFrame:
    df: pl.DataFrame = adm2.join(adm1, how="left").join(adm0, how="left")

    df = df.rename({"geometry": "theGeom"})
    df = df.with_columns(pl.col("GID_0").alias("isoA3"))
    df[["gadmId", "name", "level"]] = df.apply(_collapse_gid_and_name, axis=1, result_type="expand")
    df["id"] = [str(uuid.uuid4()) for _ in range(len(df))]
    df["isoA3"] = df["GID_0"]
    return df


def reshape_to_geo_region_table(df: pl.DataFrame, params: dict) -> pd.DataFrame:
    df = df.with_columns(pl.lit(False).alias("isCreatedByUser"))
    df = df.with_columns(params["columns"])
    return df


def reshape_to_admin_region_table(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    df = df.rename(columns={"id": "geoRegionId"})
    df["id"] = [str(uuid.uuid4()) for _ in range(len(df))]

    df["description"] = ""
    df["status"] = "active"
    df = df[params["columns"]]
    return df
