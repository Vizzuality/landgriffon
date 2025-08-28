from enum import IntEnum

import polars as pl
from geopandas import GeoDataFrame
from h3ronpy.pandas.vector import geodataframe_to_cells


class BWSCategory(IntEnum):
    """Baseline Water Stress category"""

    ARID = -1
    LOW = 0
    LOW_MEDIUM = 1
    MEDIUM_HIGH = 2
    HIGH = 3
    EXTREMELY_HIGH = 4


def __required_percent_reduction_reference(stress_category: int, stress_value: float):
    """Reference equation from old codebase. Used as reference only and for testing.

    >------- old docstring
    Calculation of the required percentage of reduction.

    This reduction is calculated in all catchment which baseline water stress is above the
    threshold 0.4. More information can be found on the LandGriffon v2.0 methodology under the
    unsustainable water use indicator.
    NOTE: There are some cases where the basin is categorised as extremely high BWS (>80%) but
    the raw value is 9999.0. We consider in those cases that the bws raw value is equal to 0.8
    ---------<
    """
    if stress_category > BWSCategory.MEDIUM_HIGH and stress_value != 9999:
        return ((stress_value - 0.4) / stress_value) * 100
    elif stress_category == BWSCategory.EXTREMELY_HIGH and stress_value == 9999:
        return ((0.8 - 0.4) / 0.8) * 100
    else:
        return 0


def _required_percent_reduction_polars(stress_category: str, stress_value: str) -> pl.Expr:
    non_saturated = (pl.col(stress_value) - 0.4) / pl.col(stress_value) * 100
    saturated = 50  # ((0.8 - 0.4) / 0.8) * 100
    return (
        pl.when(
            (pl.col(stress_category) > BWSCategory.MEDIUM_HIGH) & (pl.col(stress_value) != 9999)
        )
        .then(non_saturated)
        .otherwise(
            pl.when(
                (pl.col(stress_category) == BWSCategory.EXTREMELY_HIGH)
                & (pl.col(stress_value) == 9999)
            )
            .then(saturated)
            .otherwise(0)
        )
    )


def excess_withdrawals(
    df: pl.DataFrame, category_col: str, value_col: str, excess_withdrawal_col: str
) -> pl.DataFrame:
    return df.with_columns(
        _required_percent_reduction_polars(category_col, value_col).alias(excess_withdrawal_col)
    )


def filter_columns(gdf: GeoDataFrame, columns: dict[str, str]) -> GeoDataFrame:
    return gdf[[columns["stress_category"], columns["stress_value"], columns["geom"]]]  # type: ignore


def geo_to_h3(gdf: GeoDataFrame, h3_resolution: int) -> pl.DataFrame:
    df = geodataframe_to_cells(gdf, resolution=h3_resolution, compact=False)
    return pl.DataFrame(df)
