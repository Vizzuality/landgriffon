import ibis
import pandas as pd
import polars as pl


def complete_table_with_relations(
    materials: ibis.Table,
    admin_region: ibis.Table,
    indicator_coefficients: pl.DataFrame,
) -> pd.DataFrame:
    """Add materials and admin region relation to indicator_coefficient table.

    Returns a pandas Dataframe becaus sql functionality is only available for
    pandas datasets.
    """
    countries = indicator_coefficients.select(pl.col("country").unique()).to_series().to_list()
    hs_codes = indicator_coefficients.select(pl.col("hs_2017_code").unique()).to_series().to_list()

    materials = (
        materials.filter(materials.hsCodeId.isin(hs_codes))
        .select("id", "hsCodeId")
        .mutate(id=materials.id.cast("string"))
        .rename(materialId="id", hs_2017_code="hsCodeId")
    )
    admin_region = (
        admin_region.filter(admin_region.name.isin(countries))
        .select("id", "name")
        .mutate(id=admin_region.id.cast("string"))
        .rename(adminRegionId="id", country="name")
    )

    indicator_coefficients = indicator_coefficients.join(
        materials.to_polars(), on="hs_2017_code", how="left"
    )
    indicator_coefficients = indicator_coefficients.join(
        admin_region.to_polars(), on="country", how="left"
    )
    return indicator_coefficients.to_pandas()
