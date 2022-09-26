import argparse
import logging

import numpy as np
import rasterio as rio

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("preprocess_forestGHG")


def main(ghg_file: str, hansen_file: str, outfile: str):
    with rio.open(ghg_file) as ref:
        with rio.open(hansen_file) as hansen_src:
            if ref.transform != hansen_src.transform:
                log.error(
                    f"{ghg_file} and {hansen_file} don't have the same Transform in window {ij}."
                    f" Can't compute masking."
                )
                raise ValueError("Rasters have different transform")

            dest_profile = ref.profile.copy()
            dest_profile["nodata"] = 0
            with rio.open(outfile, "w", **dest_profile) as dest:
                log.info(f"Filtering {ghg_file} and writing to {outfile}...")
                for ij, win in ref.block_windows(1):
                    # sanity check that window transform is the same
                    ghg = ref.read(1, window=win)
                    hansen = hansen_src.read(1, window=win)
                    result = ghg * hansen
                    # convert nan to 0 to avoid having both nan and 0 coexisting as nodata
                    result = np.nan_to_num(result)
                    dest.write(result, window=win, indexes=1)
                log.info(f"Done wrinting to {outfile}...")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("ghg_file")
    parser.add_argument("hansen_file")
    parser.add_argument("outfile")
    args = parser.parse_args()
    main(args.ghg_file, args.hansen_file, args.outfile)
