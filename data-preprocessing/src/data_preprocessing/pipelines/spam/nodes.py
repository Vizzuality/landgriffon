import logging
from collections.abc import Callable

import polars as pl
from xarray import DataArray

from data_preprocessing.common.nodes import raster_to_h3

type LazyPartitionedRasters = dict[str, Callable[[], DataArray]]
type PartitionedDataFrames = dict[str, pl.DataFrame]
type LazyPartitionedDataFrames = dict[str, Callable[[], pl.DataFrame]]


def parts_to_h3_tables(parts: LazyPartitionedRasters, h3_res: int) -> PartitionedDataFrames:
    """Iterates over the SPAMs in Partitioned dataset and processes them to H3s."""
    log = logging.getLogger(__name__)
    h3s = {}
    for name, ds in parts.items():
        if name.endswith("_A"):  # just use the "All" aggregation from spam
            log.info("Downloading %s...", name)
            data = ds()
            log.info("Processing %s...", name)
            h3s[name] = raster_to_h3(data, h3_res)
    return h3s


def join_h3_table(tables: LazyPartitionedDataFrames) -> pl.DataFrame:
    log = logging.getLogger(__name__)
    log.info("Joining dataframes...")
    first = tables.popitem()
    main_df = first[1]().rename({"value": first[0]})
    for name, df in tables.items():
        main_df = main_df.join(df().rename({"value": name}), on="cell", how="full", coalesce=True)
    return main_df


def combinations(spams: pl.DataFrame, combination_parameters: dict) -> pl.DataFrame:
    for combination_name, members in combination_parameters.items():
        spams = spams.with_columns(pl.sum_horizontal(*members).alias(combination_name))
    return spams
