import logging
from collections import namedtuple
from math import radians
from pathlib import Path

import click
import h3
import h3ronpy.raster
import numpy as np
import rasterio as rio
from tqdm import tqdm

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(Path(__file__).stem)


@click.command()
@click.argument("dest_path")
@click.option("--cell_size", type=float, default=0.0833333)
@click.option("--h3_res", type=int, default=6)
def main(dest_path, cell_size, h3_res):
    """
    Make a csv table with the ratio of  h3 cell area / pixel area for all the h3 cells in a given h3 resolution.
    """
    extent = namedtuple("extent", ("west", "south", "east", "north"))
    bbox = extent(-180, -90, 180, 90)
    width = int((bbox.east - bbox.west) / cell_size)
    height = int((bbox.north - bbox.south) / cell_size)
    transform = rio.transform.from_bounds(*bbox, width=width, height=height)

    # Here we make a matrix (height * width) filled with the areas of each pixel.
    # I'm assuming a spherical earth to keep things simple and using the authalic radius as
    # it is used to compute the cell areas in h3 too https://h3geo.org/docs/core-library/restable/#cell-areas-1
    earth_radius = 6371007.2
    _, lats = rio.transform.xy(transform, list(range(height)), 0)  # pixel centroid latitudes
    pixel_area_by_lat = np.cos(np.deg2rad(lats)) * (earth_radius**2) * (radians(cell_size) ** 2)
    areas = np.ones(width) * pixel_area_by_lat[:, np.newaxis] / 1_000_000  # areas in km^2

    log.info(f"Converting raster with extent {bbox} and res {cell_size}° to h3")
    df = h3ronpy.raster.raster_to_dataframe(areas, transform, h3_resolution=h3_res, compacted=False)
    df["h3index"] = df["h3index"].apply(lambda x: hex(x)[2:])
    tqdm.pandas(desc="Getting area of h3 cells")
    df["cell_area"] = df["h3index"].progress_apply(h3.cell_area)
    df["ratio"] = df["cell_area"] / df["value"]
    log.info(f"Writing CSV with h3 cell ratios at {dest_path}")
    df.set_index("h3index").to_csv(dest_path)


if __name__ == "__main__":
    main()
