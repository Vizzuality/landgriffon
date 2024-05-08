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
    print("Reading file...")
    gdf = gpd.read_file(filename)
    print("Making h3 cells...")
    gdf["h3flat"] = geoseries_to_cells(gdf["geometry"], resolution=H3_RESOLUTION, compact=False)
    print('Compacting h3 cells...')
    gdf["h3Compact"] = [list(compact(x)) for x in gdf["h3flat"]]
    print('Converting to cell indexes to hexadecimal...')
    gdf["h3Compact"] = gdf["h3Compact"].apply(lambda arr: [hex(x)[2:] for x in arr])
    gdf["h3flat"] = gdf["h3flat"].apply(lambda arr: [hex(x)[2:] for x in arr])
    gdf = gdf.to_wkb(hex=True)
    gdf = gdf.rename({"geometry": "theGeom"})

    gdf["h3FlatLength"] = gdf["h3flat"].apply(lambda x: len(x))
    print(f"writing to {output}...")
    gdf.to_csv(output, index=False)


if __name__ == "__main__":
    main()
