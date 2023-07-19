import argparse
import json
import os
from functools import partial
from multiprocessing import set_start_method
from pathlib import Path
from typing import Tuple, Union

import numpy as np
import rasterio as rio
import requests
from rasterio.enums import Resampling
from rasterio.warp import calculate_default_transform, reproject
from requests.adapters import HTTPAdapter
from tqdm.contrib.concurrent import process_map
from urllib3 import Retry
from urllib3.exceptions import MaxRetryError

set_start_method("spawn", force=True)


# NOTE! Logs are disabled because they are not working properly with multiprocessing
# logging.basicConfig(level=logging.INFO)
# log = logging.getLogger("preprocess_forestGHG")


def parse_json(json_file: str) -> Tuple[str, str]:
    """Parse GHG tiles list from json

    Returns
    -------
    tuple
        tile name, url
    """
    with open(json_file) as f:
        sources = json.load(f)
    for feature in sources["features"]:
        attrs = feature["attributes"]
        yield attrs["tile_id"], attrs["Mg_CO2e_px_download"]


def download_ghg(url: str, name: str, store_path: str) -> Union[Path, None]:
    """Download a GHG tile with retry policy and save store_path/name.tif

    Parameters
    ----------
    url: str
        Url of the tile
    name: str
        name of the tile in the form 00N_000W
    store_path: str
        path of the folder where to save the tif

    Returns
    -------
    Path or None
        Path is returned if download is successful, None otherwise
    """
    # log.info(f"Downloading {name} tile from {url}")
    filename = Path(store_path) / f"{name}.tif"
    if filename.exists():
        return filename
    with requests.Session() as s:
        # define some retry policies because GFW api is flaky as hell
        try:
            retries = Retry(total=5, backoff_factor=1, status_forcelist=[413, 429, 502, 503, 504])
            s.mount("https://", HTTPAdapter(max_retries=retries))
            r = s.get(url, stream=True)
        except MaxRetryError:
            # log.error(f"Tile {name} download returned bad status code {r.status_code} and retries failed. Url: {url}")
            return
        if r.status_code == 200:
            with open(filename, "wb") as f:
                for chunk in r.iter_content(chunk_size=1024):
                    f.write(chunk)
            return filename
        else:
            # log.error(f"Tile {name} download returned bad status code {r.status_code}. Url: {url}")
            return


def process_ghg(ghg_file: Path, hansen_file: Path, outfile: Path) -> Path:
    """Filter GHG raster by the given hansen loss raster by multiplying

    The hansen loss raster must be previously filtered to contain only pixels of the wanted year.
    It must be a boolean mask (or 0, 1).
    The multiplication is done using a rolling window to avoid loading both rasters to memory and
    eat it all. The window uses the blocks defined in the tiff with `block_windows()` rio function
    which in the case of the GHG tiles and hansen is 400x400. It could be increased to speed things
    up but for now it is a good tradeoff between memory consumption and speed since this op is done
    in parallel for n* rasters at the same time.

    *n given by --processes argument in the script

    Parameters
    ----------
    ghg_file: Path
        path to the forest green house emission raster
    hansen_file: Path
        hansen loss raster that will be used as a mask
    outfile: Path
        output file path

    Returns
    -------
    Path
        Output file name
    """
    with rio.open(ghg_file) as ref, rio.open(hansen_file) as hansen_src:
        if ref.transform != hansen_src.transform:
            # log.error(f"{ghg_file} and {hansen_file} don't have the same Transform." f" Can't compute masking.")
            raise ValueError("Rasters have different transform")

        dest_profile = ref.profile.copy()
        dest_profile["nodata"] = 0
        with rio.open(outfile, "w", **dest_profile) as dest:
            # log.info(f"Filtering {ghg_file} and writing to {outfile}...")
            for ij, win in ref.block_windows(1):
                ghg = ref.read(1, window=win)
                hansen = hansen_src.read(1, window=win)
                result = ghg * hansen
                # convert nan to 0 to avoid having both nan and 0 coexisting as nodata
                result = np.nan_to_num(result)
                dest.write(result, window=win, indexes=1)
            # log.info(f"Done wrinting to {outfile}...")
    return outfile


def resample_ghg(ghg_file: Path, dst_file: Path, dst_resolution: Tuple[float, float]) -> None:
    """Resample raster to given resolution. Maintain the same CRS

    Parameters
    ----------
    ghg_file: Path
        path to the forest green house emission raster
    dst_file: Path
        destination file for the resampled ghg raster
    dst_resolution: tuple[float, float]
        final resolution in the units of the ghg raster crs (degrees normally)
    """
    # log.info(f"Resampling {ghg_file} to resolution {dst_resolution}...")
    with rio.open(ghg_file) as src:
        dst_transf, dst_width, dst_height = calculate_default_transform(
            src.crs, src.crs, src.width, src.height, *src.bounds, resolution=dst_resolution
        )
        dst_profile = src.profile.copy()
        dst_profile.update({"transform": dst_transf, "width": dst_width, "height": dst_height})
        with rio.open(dst_file, "w", **dst_profile) as dst:
            reproject(
                source=rio.band(src, 1),
                destination=rio.band(dst, 1),
                src_transform=src.transform,
                src_crs=src.crs,
                dst_transform=dst_transf,
                dst_crs=src.crs,
                resampling=Resampling.sum,
            )


def main(remove_intermediates: bool, out_folder: str, hansen_folder: str, tile_name_url: tuple) -> None:
    """Processing pipeline for a single raster
        - Download
        - Filter according to the given hansen loss
        - Resample filtered Result

    This function is used as the entrypoint in each process spawned by the
    multiprocessing pool
    """
    tile_name, url = tile_name_url  # bypass the use of starmap to map by giving a tuple
    ghg_file = download_ghg(url, tile_name, out_folder)
    if not ghg_file:
        return  # early return to avoid exceptions since the download failed.
    hansen_file = Path(hansen_folder) / "tiles" / f"{tile_name}.tif"
    if not hansen_file.exists():
        # log.error(f"Couldn't find hansen tile {hansen_file} to use as mask.")
        raise FileNotFoundError(f"Hansen tile {tile_name} not found")
    out_file = ghg_file.with_name(ghg_file.stem + "_2020" + ghg_file.suffix)
    ghg_file = process_ghg(ghg_file, hansen_file, out_file)
    resampled_out_file = Path(out_folder) / "resampled" / (out_file.stem + "_10km" + out_file.suffix)
    resample_ghg(ghg_file, resampled_out_file, (0.0833333333333286, 0.0833333333333286))
    # log.info(f"Done with {tile_name}")
    if remove_intermediates:
        os.remove(ghg_file)
        os.remove(hansen_file)
        os.remove(ghg_file)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("urls_list")
    parser.add_argument("out_folder")
    parser.add_argument("hansen_folder")
    parser.add_argument("--processes", type=int, default=10)
    parser.add_argument("--remove_intermediates", action="store_true", default=False)
    args = parser.parse_args()

    main_part = partial(main, args.remove_intermediates, args.out_folder, args.hansen_folder)

    tiles = list(parse_json(args.urls_list))
    process_map(main_part, tiles, max_workers=args.processes)
