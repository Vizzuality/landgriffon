import argparse
import json
import logging
from functools import partial
from multiprocessing import Pool
from pathlib import Path

import numpy as np
import rasterio as rio
from rasterio.enums import Resampling
from rasterio.warp import calculate_default_transform, reproject
import requests
from requests.adapters import HTTPAdapter
from tqdm import tqdm
from urllib3 import Retry

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("preprocess_forestGHG")


def parse_json(json_file: str) -> tuple[str, str]:
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


def download_ghg(url: str, name: str, store_path: str) -> Path:
    """Download a GHG tile and save .tig

    Returns
    -------
    file_name: Path
    """
    log.info(f"Downloading {name} tile from {url}")
    with requests.Session() as s:
        # define some retry policies because GFW api is flaky as hell
        retries = Retry(total=5, backoff_factor=1, status_forcelist=[413, 429, 502, 503, 504])
        s.mount("https://", HTTPAdapter(max_retries=retries))
        r = s.get(url, stream=True)
        filename = Path(store_path) / f"{name}.tif"
        if r.status_code != 200 and retries.is_exhausted():
            log.error(f"Tile {name} download returned bad status code {r.status_code}. Url: {url}")
            raise Exception(f"Couldn't download GHG tile {name}")
        else:
            total = int(r.headers.get("content-length", 0))
            with open(filename, "wb") as f, tqdm(
                desc=name,
                total=total,
                unit="iB",
                unit_scale=True,
                unit_divisor=1024,
            ) as bar:
                for chunk in r.iter_content(chunk_size=1024):
                    size = f.write(chunk)
                    bar.update(size)
    return filename


def process_ghg(ghg_file: Path, hansen_file: Path, outfile: Path) -> Path:
    with rio.open(ghg_file) as ref, rio.open(hansen_file) as hansen_src:
        if ref.transform != hansen_src.transform:
            log.error(
                f"{ghg_file} and {hansen_file} don't have the same Transform."
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
    return outfile


def resample_ghg(ghg_file: Path, dst_file: Path, dst_resolution: tuple[float, float]):
    log.info(f"Resampling {ghg_file} to resolution {dst_resolution}...")
    with rio.open(ghg_file) as src:
        dst_transf, dst_width, dst_height = calculate_default_transform(
            src.crs, src.crs, src.width, src.height, *src.bounds, resolution=dst_resolution
        )
        dst_profile = src.profile.copy()
        dst_profile.update({
            "transform": dst_transf,
            "width": dst_width,
            "height": dst_height
        })
        with rio.open(dst_file, "w", **dst_profile) as dst:
            reproject(
                source=rio.band(src, 1),
                destination=rio.band(dst, 1),
                src_transform=src.transform,
                src_crs=src.crs,
                dst_transform=dst_transf,
                dst_crs=src.crs,
                resampling=Resampling.sum
            )


def main(out_folder, hansen_folder, tile_name, url):
    filename = download_ghg(url, tile_name, out_folder)
    hansen_file = Path(hansen_folder) / f"{tile_name}.tif"
    if not hansen_file.exists():
        log.error(f"Couldn't find hansen tile {hansen_file} to use as mask.")
        raise FileNotFoundError(f"Hansen tile {tile_name} not found")
    out_file = filename.with_name(filename.stem + "_2020" + filename.suffix)
    ghg_file = process_ghg(filename, hansen_file, out_file)
    resampled_out_file = Path(out_folder) / "resampled" / (out_file.stem + "_10km" + out_file.suffix)
    resample_ghg(ghg_file, resampled_out_file, (0.0833333333333286, 0.0833333333333286))
    log.info(f"Done with {tile_name}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("urls_list")
    parser.add_argument("out_folder")
    parser.add_argument("hansen_folder")
    parser.add_argument("--processes", type=int, default=10)
    args = parser.parse_args()

    main_part = partial(main, args.out_folder, args.hansen_folder)
    with Pool(processes=args.processes) as pool:
        pool.starmap(main_part, parse_json(args.urls_list))
