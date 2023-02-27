import logging
import sys
from contextlib import ExitStack
from pathlib import Path

import click
import h3ronpy.raster
import pandas as pd
import rasterio as rio
from rasterio import DatasetReader
from tqdm import tqdm

from data.h3_data_importer.utils import DTYPES_TO_PG, slugify

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("tif_folder_to_h3_table")


def check_srs(reference_raster: DatasetReader, raster: DatasetReader, _raise: bool = True):
    """Checks that raster has same projection as reference"""
    if reference_raster.crs != raster.crs:
        mssg = (
            f"Rasters have different CRS: {reference_raster.name} {reference_raster.crs} "
            f"vs {raster.name} {raster.crs}"
        )
        if _raise:
            raise ValueError(mssg)
        log.error(mssg)
        sys.exit(1)


def check_transform(reference_raster: DatasetReader, raster: DatasetReader, _raise: bool = True):
    """Checks that raster has same transform as reference"""
    if reference_raster.transform != raster.transform:
        mssg = (
            f"Rasters have different Transform: {reference_raster.name} {reference_raster.transform} "
            f"vs {raster.name} {raster.transform}"
        )
        if _raise:
            raise ValueError(mssg)
        log.error(mssg)
        sys.exit(1)


def raster_to_h3(raster: DatasetReader, h3_resolution: int) -> pd.DataFrame:
    """Convert a raser to a dataframe with h3index -> value

    Uses `h3ronpy.raster.raster_to_dataframe()` wich uses already multiprocessing under the hood
    so there's no need to iterate over the raster windows anymore.
    """
    h3 = h3ronpy.raster.raster_to_dataframe(
        raster.read(1),
        transform=raster.transform,
        nodata_value=raster.nodata,
        h3_resolution=h3_resolution,
        compacted=False,
        geo=False,
    )
    return h3


def make_table_schema(df: pd.DataFrame) -> str:
    return ", ".join([f'"{col}" {DTYPES_TO_PG[str(dtype)]}' for col, dtype in zip(df.columns, df.dtypes)])


@click.command()
@click.argument("folder", type=click.Path(exists=True, path_type=Path))
@click.argument("table", type=str)
@click.argument("data_type", type=str)
@click.argument("dataset", type=str)
@click.argument("year", type=int)
@click.option("contextual", is_flag=True, help="If the data has to be referenced in contextual_layers table.")
@click.option("h3res", type=int, default=6, help="h3 resolution to use")
@click.option("thread-count", "thread_count", type=int, default=4, help="Number of threads to use")
def main(folder: Path, table: str, data_type: str, dataset: str, year: int, h3res: int):
    """Reads a folder of .tif, converts to h3 and loads into a PG table

    All GeoTiffs in the folder must have identical projection, transform, etc.
    The resulting table will contain a column for each GeoTiff.
    """
    rasters = list(folder.glob("*.tif"))
    with ExitStack() as cm:
        raster_readers = [cm.enter_context(rio.open(raster)) for raster in rasters]
        reference_raster = raster_readers[0]
        h3s = []
        pbar = tqdm(raster_readers)
        for raster_reader in pbar:
            pbar.set_description(raster_reader.name)
            check_srs(reference_raster, raster_reader)
            check_transform(reference_raster, raster_reader)
            df = raster_to_h3(raster_reader, h3res).set_index("h3index")
            df = df.rename(columns={"value": slugify(raster_reader.filename)})
            h3s.append(raster_to_h3(raster_reader, h3res))
    df = h3s[0].join(h3s[1:]) if len(raster_reader) > 1 else h3s[0]


if __name__ == "__main__":
    main()
