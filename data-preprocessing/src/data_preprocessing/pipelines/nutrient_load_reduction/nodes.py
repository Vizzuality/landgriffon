import polars as pl
from geopandas import GeoDataFrame
from h3ronpy.pandas.vector import geodataframe_to_cells

P_THRESHOLD = 0.046
N_THRESHOLD = 0.7


def __calculate_perc_reduction_reference(row) -> float:
    """
    Old code's equation implementation. Used as reference for _load_reduction_percentage.

    >-------------------
    Calculation of the required Load Reduction.

    This equation is applied to only the basin-specific limiting nutrient as identified by
    McDowell et al. (2020)
    The global concentration thresholds values for Total N (0.70 mg-N/L) and Total P (0.046 mg-P/L)
    represent acceptable levels of algal growth.

    More information can be found on the LandGriffon v2.0 methodology
    <---------------------
    """
    if row["limiting"] == "P-limited":
        return max(0, ((row["tpc_raw"] - 0.046) / row["tpc_raw"]) * 100)
    elif row["limiting"] == "N-limited":
        return max(0, ((row["tnc_raw"] - 0.7) / row["tnc_raw"]) * 100)
    else:
        return 0


def _load_reduction_percentage(
    limiting_factor_col: str, total_p_col: str, total_n_col: str
) -> pl.Expr:
    p_limiting_reduction: pl.Expr = (pl.col(total_p_col) - P_THRESHOLD) / pl.col(total_p_col) * 100
    n_limiting_reduction: pl.Expr = (pl.col(total_n_col) - N_THRESHOLD) / pl.col(total_n_col) * 100
    return (
        pl.when(pl.col(limiting_factor_col) == "P-limited")
        .then(p_limiting_reduction)
        .otherwise(
            pl.when(limiting_factor_col == "N-limited").then(n_limiting_reduction).otherwise(0)
        )
        .clip(0)
    )


def geo_to_h3(gdf: GeoDataFrame, h3_resolution: int) -> pl.DataFrame:
    df = geodataframe_to_cells(gdf, resolution=h3_resolution, compact=False)
    return pl.DataFrame(df)


def load_reduction(df: pl.DataFrame, cols: dict[str, str]) -> pl.DataFrame:
    return df.with_columns(
        _load_reduction_percentage(
            cols["limiting_factor_col"], cols["total_p_col"], cols["total_n_col"]
        ).alias(cols["load_reduction_col"])
    )
