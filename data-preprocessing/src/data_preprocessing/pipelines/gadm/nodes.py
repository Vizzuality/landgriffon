import logging
import uuid
from typing import Literal

import geopandas as gpd
import pandas as pd
import polars as pl
from h3ronpy import cells_to_string
from h3ronpy.pandas.vector import geoseries_to_cells

log = logging.getLogger(__name__)


def _last_meaningful_gadm_level(gid_or_name: Literal["GID", "NAME"]) -> pl.Expr:
    expr = (
        pl.when(pl.col("GID_1").is_not_null())
        .then(pl.col(f"{gid_or_name}_1"))
        .when(pl.col("GID_2").is_not_null())
        .then(pl.col(f"{gid_or_name}_2"))
        .when(pl.col("GID_3").is_not_null())
        .then(pl.col(f"{gid_or_name}_3"))
        .otherwise(pl.col(f"{gid_or_name}_0"))
    )
    return expr


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
    # add UUID column
    df_len = df.select(pl.len()).collect().item()
    df = df.with_columns(pl.Series(name="id", values=[str(uuid.uuid4()) for _ in range(df_len)]))
    df = df.with_columns(
        gadm_id=_last_meaningful_gadm_level("GID"), name=_last_meaningful_gadm_level("NAME")
    )
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
