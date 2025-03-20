import logging
import uuid
from typing import Literal

import geopandas as gpd
import polars as pl
from h3ronpy import cells_to_string
from h3ronpy.pandas.vector import geoseries_to_cells

log = logging.getLogger(__name__)


def _last_non_null_gadm_level(
    gid_or_name: Literal["GID", "NAME"], strip_version: bool = True
) -> pl.Expr:
    expr = (
        pl.when(pl.col("GID_2").is_not_null())
        .then(pl.col(f"{gid_or_name}_2"))
        .when(pl.col("GID_1").is_not_null())
        .then(pl.col(f"{gid_or_name}_1"))
        .otherwise(pl.col(f"{gid_or_name}_0"))
    )
    if strip_version:
        # GADM has a version id appended to som GIDs in the form of `_X`
        # where X is the version number
        expr = expr.str.replace(r"_\d?$", "")
    return expr


def _get_gadm_level() -> pl.Expr:
    return (
        pl.when(pl.col("GID_2").is_not_null())
        .then(2)
        .when(pl.col("GID_1").is_not_null())
        .then(1)
        .otherwise(0)
    )


def _find_parent_id() -> pl.Expr:
    """Given a table with columns id | GID_0 | GID_1 | GID_2
    The immediate parent id is the first id of previous level
    """
    pl.when(pl.col("GID_2").is_not_null())


def gadm_to_h3(gdf: gpd.GeoDataFrame, h3_resolution: int, tolerance: float | None) -> pl.DataFrame:
    if tolerance is not None:
        log.info("Simplifying geometries with tolerance: %s", tolerance)
        gdf["geometry"] = gdf.simplify(tolerance)
    gdf["h3Compact"] = geoseries_to_cells(gdf["geometry"], resolution=h3_resolution, compact=True)
    gdf["h3Compact"] = gdf["h3Compact"].apply(lambda arr: cells_to_string(arr).to_numpy())
    df = gdf.to_wkb(hex=True)
    return pl.DataFrame(df)


def join_gadm_levels(adm0: pl.LazyFrame, adm1: pl.LazyFrame, adm2: pl.LazyFrame) -> pl.LazyFrame:
    # For some reason, admin level 0 layer doesn't follow the pattern of the other layers
    adm0 = adm0.rename({"COUNTRY": "NAME_0"})
    # admin 1 and 2 don't have any non-null NAME_0, it causes casting issues in the join
    adm1 = adm1.drop("NAME_0")
    adm2 = adm2.drop("NAME_0")

    df: pl.LazyFrame = adm2.join(
        adm1, how="full", on=["GID_1", "GID_0", "NAME_1", "geometry", "h3Compact"], coalesce=True
    ).join(adm0, how="full", on=["GID_0", "geometry", "h3Compact"], coalesce=True)
    iso_to_country_map = dict(adm0.select("GID_0", "NAME_0").collect().iter_rows())
    df = df.with_columns(
        # fill in missing values in NAME_0 with the corresponding country name
        pl.col("NAME_0").fill_null(pl.col("GID_0").replace(iso_to_country_map)),
    )
    return df


def add_unified_columns(df: pl.LazyFrame) -> pl.LazyFrame:
    df_len = df.select(pl.len()).collect().item()
    df = df.with_columns(
        # add UUID column
        pl.Series(name="id", values=[str(uuid.uuid4()) for _ in range(df_len)]),
        gadm_id=_last_non_null_gadm_level("GID"),
        name=_last_non_null_gadm_level("NAME"),
        level=_get_gadm_level(),
    )
    return df


def reshape_to_geo_region_table(df: pl.LazyFrame, params: dict) -> pl.LazyFrame:
    df = df.with_columns(pl.lit(False).alias("isCreatedByUser"))
    df = df.rename(params["column_map"])
    df = df.with_columns(params["columns"])
    return df


def reshape_to_admin_region_table(df: pl.LazyFrame, params: dict) -> pl.LazyFrame:
    df = df.rename({"id": "geoRegionId"})
    df_len = df.select(pl.len()).collect().item()
    df = df.with_columns(
        pl.Series(name="id", values=[str(uuid.uuid4()) for _ in range(df_len)])
    )  # add UUID column


    df = df.rename(params["column_map"])
    df = df.with_columns(params["columns"])
    return df
