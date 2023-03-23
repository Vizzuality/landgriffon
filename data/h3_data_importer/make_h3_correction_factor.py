"""
This script takes a pixel resolution in degrees (uses epsg:4326) and generates

"""
from collections import namedtuple
from math import radians

import click
import h3
import h3ronpy.raster
import numpy as np
import rasterio as rio


@click.command()
@click.argument("dest_path")
@click.option("--cell_size", type=float, default=0.0833333)
@click.option("--h3_res", type=int, default=6)
def main(dest_path, cell_size, h3_res):
    extent = namedtuple("extent", ("west", "south", "east", "north"))
    bbox = extent(-180, -90, 180, 90)
    width = int((bbox.east - bbox.west) / cell_size)
    height = int((bbox.north - bbox.south) / cell_size)
    transform = rio.transform.from_bounds(*bbox, width=width, height=height)

    earth_radius = 6371007.2  # authalic radius of earth in meters

    _, lats = rio.transform.xy(transform, list(range(height)), 0)  # pixel centroid latitudes
    pixel_area_by_lat = np.cos(np.deg2rad(lats)) * (earth_radius**2) * (radians(cell_size) ** 2)
    areas = np.ones(width) * pixel_area_by_lat[:, np.newaxis] / 1_000_000  # areas in km^2

    df = h3ronpy.raster.raster_to_dataframe(areas, transform, h3_resolution=h3_res, compacted=False)
    df["h3index"] = df["h3index"].apply(lambda x: hex(x)[2:])
    df["cell_area"] = df["h3index"].apply(h3.cell_area)
    df["ratio"] = df["value"] / df["cell_area"]
    df.set_index("h3index").to_csv(dest_path)


if __name__ == "__main__":
    main()
