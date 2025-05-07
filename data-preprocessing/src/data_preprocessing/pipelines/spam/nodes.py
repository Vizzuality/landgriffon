import logging
from collections.abc import Callable

import polars as pl
from h3ronpy.raster import nearest_h3_resolution, raster_to_dataframe
from xarray import DataArray

type LazyPartitionedRasters = dict[str, Callable[[], DataArray]]
type PartitionedDataFrames = dict[str, pl.DataFrame]
type LazyPartitionedDataFrames = dict[str, Callable[[], pl.DataFrame]]


def to_h3(raster: DataArray) -> pl.DataFrame:
    """Convert a raster to h3 hexagons
    Args:
        raster: raster data.
    Returns:
        DataFrame of h3 hexagons with the sampled values.
    """
    h3_resolution = nearest_h3_resolution(raster.rio.shape, raster.rio.transform())
    table = raster_to_dataframe(
        raster.to_numpy()[0],
        raster.rio.transform(),
        h3_resolution=h3_resolution,
        nodata_value=raster.rio.nodata,
        compact=False,
    )
    df = pl.DataFrame(pl.from_arrow(table))  # force type to DataFrame
    return df


def parts_to_h3_tables(
    spams: LazyPartitionedRasters,
) -> PartitionedDataFrames:
    """Iterates over the SPAMs in Partitioned dataset and processes them to H3s."""
    log = logging.getLogger(__name__)
    h3s = {}
    for name, ds in spams.items():
        if name.endswith("_A"):  # just use the "All" aggregation from spam
            log.info("Downloading %s...", name)
            data = ds()
            log.info("Processing %s...", name)
            h3s[name] = to_h3(data)
    return h3s


def join_h3_table(tables: LazyPartitionedDataFrames) -> pl.DataFrame:
    log = logging.getLogger(__name__)
    log.info("Joining dataframes...")
    first = tables.popitem()
    main_df = first[1]().rename({"value": first[0]})
    for name, df in tables.items():
        main_df = main_df.join(df().rename({"value": name}), on="cell", how="outer", coalesce=True)
    return main_df


def combinations(spams: pl.DataFrame, combination_parameters: dict) -> pl.DataFrame:
    for combination_name, members in combination_parameters.items():
        spams = spams.with_columns(pl.sum_horizontal(*members).alias(combination_name))
    return spams
