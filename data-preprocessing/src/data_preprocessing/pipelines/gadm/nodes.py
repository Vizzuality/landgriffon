import logging

import geopandas as gpd
import polars as pl
import polars.selectors as cs
from h3ronpy import cells_to_string
from h3ronpy.pandas.vector import geoseries_to_cells

log = logging.getLogger(__name__)


def _get_gadm_level() -> pl.Expr:
    return (
        pl.when(pl.col("GID_2").is_not_null())
        .then(2)
        .when(pl.col("GID_1").is_not_null())
        .then(1)
        .otherwise(0)
    )


def _get_parent_id() -> pl.Expr:
    return (
        pl.when(pl.col("level") > 0)
        .then(pl.col("gadm_id").str.replace(r"\.\d+$", "").replace(pl.col("gadm_id"), pl.col("id")))
        .otherwise(None)
    ).cast(pl.Int64)


def gadm_to_h3(gdf: gpd.GeoDataFrame, h3_resolution: int, tolerance: float | None) -> pl.DataFrame:
    if tolerance is not None:
        log.info("Simplifying geometries with tolerance: %s", tolerance)
        gdf["geometry"] = gdf.simplify(tolerance)
    gdf["h3_compact"] = geoseries_to_cells(gdf["geometry"], resolution=h3_resolution, compact=True)
    gdf["h3_compact"] = gdf["h3_compact"].apply(lambda arr: cells_to_string(arr).to_numpy())
    df = gdf.to_wkb(hex=True)
    return pl.DataFrame(df)


def join_gadm_levels_and_clean(
    adm0: pl.LazyFrame, adm1: pl.LazyFrame, adm2: pl.LazyFrame
) -> pl.LazyFrame:
    # For some reason, admin level 0 layer doesn't follow the pattern of the other layers
    adm0 = adm0.rename({"COUNTRY": "NAME_0"})
    # admin 1 and 2 don't have any non-null NAME_0, it causes casting issues in the join
    adm1 = adm1.drop("NAME_0")
    adm2 = adm2.drop("NAME_0")

    df: pl.LazyFrame = adm2.join(
        adm1, how="full", on=["GID_1", "GID_0", "NAME_1", "geometry", "h3_compact"], coalesce=True
    ).join(adm0, how="full", on=["GID_0", "geometry", "h3_compact"], coalesce=True)

    # fill in missing values in NAME_0 with the corresponding country name
    iso_to_country_map = dict(adm0.select("GID_0", "NAME_0").collect().iter_rows())
    df = df.with_columns(
        pl.col("NAME_0").fill_null(pl.col("GID_0").replace(iso_to_country_map)),
    )

    # remove rows where GID_x has ? as placeholder for regions under contest
    df = df.remove(pl.any_horizontal(cs.contains("GID_") == "?"))
    return df


def add_unified_columns(df: pl.LazyFrame) -> pl.DataFrame:
    df = df.with_columns(
        # remove version suffix from GID like AFG.1_1 to AFG.1
        gadm_id=pl.coalesce(["GID_2", "GID_1", "GID_0"]).str.replace(r"_\d?$", ""),
        name=pl.coalesce(["NAME_2", "NAME_1", "NAME_0"]),
        level=_get_gadm_level(),
    )
    df = df.with_row_index("id", offset=1)
    return df.collect()


def reshape_to_geo_region_table(df: pl.DataFrame, params: dict) -> pl.DataFrame:
    df = df.with_columns(pl.lit(False).alias("is_created_by_user"))
    df = df.rename(params["column_map"])
    df = df.select(params["columns"])
    return df


def reshape_to_admin_region_table(df: pl.DataFrame, params: dict) -> pl.DataFrame:
    df = df.with_columns(parent_id=_get_parent_id())
    df = df.with_columns(pl.col("id").alias("geo_region_id"))
    df = df.rename(params["column_map"])
    df = df.select(params["columns"])
    return df
