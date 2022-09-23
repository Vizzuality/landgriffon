import argparse
import logging

from rasterio.enums import Resampling
import rioxarray

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("preprocess_forestGHG")


def main(ghg_file: str, hansen_file: str, outfile: str, nodata: int = 0):
    ghg = rioxarray.open_rasterio(ghg_file)
    loss = rioxarray.open_rasterio(hansen_file)

    if ghg.rio.transform() != loss.rio.transform():
        log.error(
            f"{ghg_file} and {hansen_file} don't have the same Transform. Can't compute masking."
        )
        raise ValueError("Rasters have different transform")

    log.info(f"Masking {ghg_file} with {hansen_file}...")
    # loss should be already a mask of 0 1 so multiplying will keep only the pixels
    # that are 1 in hansen forest loss
    ghg.data *= loss.data

    del loss  # free some memory
    # reproject to 0.083 degrees per pixel
    downscale_factor = ghg.rio.resolution()[0] / 0.0833333333333286

    new_width = int(ghg.rio.width * downscale_factor)
    new_height = int(ghg.rio.height * downscale_factor)

    log.info(f"Resampling {ghg_file} to 0.083 degrees..")
    ghg_10km = ghg.rio.reproject(
        ghg.rio.crs,
        shape=(new_height, new_width),
        resampling=Resampling.sum,
    ).rio.set_nodata(nodata)
    ghg_10km.rio.to_raster(outfile)
    log.info(f"Done writing results to {outfile}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("ghg_file")
    parser.add_argument("hansen_file")
    parser.add_argument("outfile")
    parser.add_argument("--nodata", default=0)
    args = parser.parse_args()
    main(args.ghg_file, args.hansen_file, args.outfile, nodata=args.nodata)
