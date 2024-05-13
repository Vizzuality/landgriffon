"""Converts the GADM Shapefile to a csv with h3 cells for ingesting
into geo_region table.
"""

import uuid
from pathlib import Path

import click
import geopandas as gpd
from h3ronpy.pandas import compact
from h3ronpy.pandas.vector import geoseries_to_cells

H3_RESOLUTION = 6


@click.command()
@click.argument("filename", type=click.Path(exists=True, path_type=Path))
@click.argument("output", type=click.Path(path_type=Path))
def main(filename: Path, output) -> None:
    """Convert gadm shapefile to csv with h3 columns"""
    gdf = gpd.read_file(filename)
    print("Making h3 cells...")
    gdf["h3Flat"] = geoseries_to_cells(gdf["geometry"], resolution=H3_RESOLUTION, compact=False)
    gdf["h3Compact"] = [list(compact(x)) for x in gdf["h3Flat"]]
    gdf["h3Compact"] = gdf["h3Compact"].apply(lambda arr: [hex(x)[2:] for x in arr])
    gdf["h3Flat"] = gdf["h3Flat"].apply(lambda arr: [hex(x)[2:] for x in arr])

    # convert h3 lists to sql literal arrays
    gdf["h3Compact"] = gdf["h3Compact"].apply(lambda x: f"{{{','.join(e for e in x)}}}")
    gdf["h3Flat"] = gdf["h3Flat"].apply(lambda x: f"{{{','.join(e for e in x)}}}")

    gdf = gdf.to_wkb(hex=True)
    gdf = gdf.drop(["name"], axis=1)
    gdf = gdf.rename(columns={"geometry": "theGeom", "mpath": "name"})

    gdf["h3FlatLength"] = gdf["h3Flat"].apply(lambda x: len(x))
    gdf["id"] = [str(uuid.uuid4()) for _ in range(len(gdf))]
    print(f"Writing to {output}...")
    gdf.to_csv(output, index=False, columns=["id", "h3Compact", "h3Flat", "h3FlatLength", "name", "theGeom"])
    # gdf.to_parquet(output, index=False, columns=["id", "h3Compact", "h3Flat", "h3FlatLength", "name", "theGeom"])


if __name__ == "__main__":
    main()
