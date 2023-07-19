import click
import numpy as np
import rasterio as rio
import rasterio.windows


@click.command()
@click.option("--input_tile", "-i", help="Input hansen tile filename", type=str, required=True)
@click.option("--output_tile", "-o", help="Output hansen tile filename", type=str, required=True)
@click.option("--non_natural_forest_url", "-m", help="Non natural forest mask url", type=str, required=True)
def main(input_tile: str, output_tile: str, non_natural_forest_url: str):
    """Mask every hansen file with the corresponding non-natural forest mask"""
    click.echo(f"Masking {input_tile} with {non_natural_forest_url} and writing to {output_tile}...")
    with rio.env.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_USE_HEAD=False):

        with rio.open(input_tile) as src:
            vrt_options = {
                'resampling': rio.enums.Resampling.nearest,
                'crs': src.crs,
                'transform': src.transform,
                'height': src.height,
                'width': src.width,
            }

            with rio.open(non_natural_forest_url) as non_natural_forest_src:
                read_window = rio.windows.from_bounds(
                    *src.bounds, transform=non_natural_forest_src.transform
                )
                assert src.transform == non_natural_forest_src.window_transform(read_window)

                non_natural_forest = non_natural_forest_src.read(1, window=read_window)
                deforestation_data = src.read(1)

                deforestation_data = np.where(non_natural_forest, deforestation_data, 0)

                with rio.open(
                    output_tile,
                    "w",
                    driver="GTiff",
                    height=src.height,
                    width=src.width,
                    count=1,
                    dtype=deforestation_data.dtype,
                    crs=src.crs,
                    transform=src.transform,
                    compress="deflate",
                ) as dst:
                    dst.write(deforestation_data, 1)


if __name__ == "__main__":
    main()
