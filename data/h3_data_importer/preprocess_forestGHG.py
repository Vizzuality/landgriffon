import argparse
import logging

import rasterio as rio
from tqdm import tqdm

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("preprocess_forestGHG")


def main(ghg_file: str, hansen_file: str, outfile: str):
    with rio.open(ghg_file) as ref:
        with rio.open(hansen_file) as hansen_src:
            dest_profile = ref.profile.copy()
            with rio.open(outfile, "w", **dest_profile) as dest:
                windows = list(ref.block_windows(1))
                log.info(f"Filtering {ghg_file}...")
                for ij, win in tqdm(windows):
                    # sanity check that window transform is the same
                    ref_window_transfrom = ref.window_transform(win)
                    if ref_window_transfrom != hansen_src.window_transform(win):
                        log.error(
                            f"{ghg_file} and {hansen_file} don't have the same Transform in window {ij}."
                            f" Can't compute masking."
                        )
                        raise ValueError("Rasters have different transform")

                    ghg = ref.read(1, window=win)
                    hansen = hansen_src.read(1, window=win)
                    result = ghg * hansen

                    dest.write(result, window=win, indexes=1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("ghg_file")
    parser.add_argument("hansen_file")
    parser.add_argument("outfile")
    args = parser.parse_args()
    main(args.ghg_file, args.hansen_file, args.outfile)
