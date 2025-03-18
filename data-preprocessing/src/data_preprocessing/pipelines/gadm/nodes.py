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


def join_gadm_levels(adm0: pl.LazyFrame, adm1: pl.LazyFrame, adm2: pl.LazyFrame) -> pl.LazyFrame:
    """This func is heavily depending on the columns names of the dataframes so beware of any
    changes to the data structure may be catastrophic for it.
    """
    # For some reason, admin level 0 layer doesn't follow the pattern of the other layers
    adm0 = adm0.rename({"COUNTRY": "NAME_0"})
    iso_to_country_map = dict(adm0.select("GID_0", "NAME_0").collect().iter_rows())
    # admin 1 and 2 don't have any non-null NAME_0 so it causes casting issues in the join
    adm1 = adm1.drop("NAME_0")
    adm2 = adm2.drop("NAME_0")
    df: pl.LazyFrame = adm2.join(
        adm1, how="full", on=["GID_1", "GID_0", "NAME_1", "geometry", "h3Compact"], coalesce=True
    ).join(adm0, how="full", on=["GID_0", "geometry", "h3Compact"], coalesce=True)
    # fill in missing values in NAME_0 with the corresponding country name
    df = df.with_columns(pl.col("NAME_0").fill_null(pl.col("GID_0").replace(iso_to_country_map)))
    df = df.with_columns(pl.lit(str(uuid.uuid4())).alias("id"))

    return df


def reshape_to_geo_region_table(df: pl.DataFrame, params: dict) -> pd.DataFrame:
    df = df.with_columns(pl.lit(False).alias("isCreatedByUser"))
    df = df.rename(params["column_map"])
    df = df.with_columns(params["columns"])
    return df


def reshape_to_admin_region_table(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    df = df.rename(columns={"id": "geoRegionId"})
    df["id"] = [str(uuid.uuid4()) for _ in range(len(df))]

    df["description"] = ""
    df["status"] = "active"
    df = df[params["columns"]]
    return df
