import logging

import duckdb
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


def _parent_id_column(df: pl.DataFrame) -> pl.DataFrame:
    highest_level = df.select(pl.col("level").unique().sort().last()).item()
    gid_to_id = dict(df.filter(pl.col("level") < highest_level).select("gadm_id", "id").iter_rows())
    return df.with_columns(
        parent_id=pl.when(pl.col("level") > 0)
        .then(pl.col("gadm_id").str.replace(r"\.\d+$", "").replace(gid_to_id))
        .otherwise(None)
        .cast(pl.Int64)
    )


def _materialized_path(df: pl.DataFrame) -> pl.DataFrame:
    """Compute the materialized path with the form
    parent_parent_id.parent_id.id
    """
    # Use duckdb to compute the materialized path because it has RECURSIVE cte
    #  and I failed with polars.
    mpath = duckdb.sql(
        """
        WITH RECURSIVE hierarchy AS (
            SELECT
                id,
                parent_id,
                CAST(id AS TEXT) AS mpath
            FROM
                df
            WHERE
                parent_id IS NULL
            UNION ALL
            SELECT
                t.id,
                t.parent_id,
                h.mpath || '.' || t.id
            FROM
                df t
            INNER JOIN
                hierarchy h ON t.parent_id = h.id
        )
        SELECT id, mpath FROM hierarchy;
    """
    ).pl()
    return mpath


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
    return df


def special_cases(df: pl.LazyFrame) -> pl.LazyFrame:
    # remove rows where GID_x has ? as placeholder for regions under contest
    df = df.remove(pl.any_horizontal(cs.contains("GID_") == "?"))
    # TODO [HACK]: temporarily removes territories that have XXX.YYY as GID_1  like Hong Kong and Macau
    #  It is an special patter only affecting ~20 rows mainly for China's special territories.
    df = df.remove(pl.col("GID_1").str.contains(r"\.[A-Z]{3}"))
    # In São Tomé and Príncipe, there no level 1  representation of principe autonomous region, and only it is
    # only represented by its district Pagué so it is an orphan entry. Here I create the Principe entry
    # https://en.wikipedia.org/wiki/Autonomous_Region_of_Pr%C3%ADncipe
    principe_row = df.filter(pl.col("GID_1") == "STP.1_1").clone()
    principe_row = principe_row.with_columns(
        NAME_2=None,
        GID_2=None,
    )
    df = pl.concat([df, principe_row])
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
    df = _parent_id_column(df)
    df = df.join(_materialized_path(df), on="id")
    df = df.with_columns(
        pl.col("id").alias("geo_region_id"),
        status=pl.lit("inactive"),
    )
    df = df.rename(params["column_map"])
    df = df.select(params["columns"])
    return df
