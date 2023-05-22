import argparse

import cv2
import rasterio as rio
import numpy as np


def main(filename: str, out_file: str, radius: int = 50):
    with rio.open(filename) as src:
        meta = src.meta.copy()
        transform = src.transform
        arr = src.read(1)
        orig_crs = src.crs
    # km per degree near the equator. At high lats this will bite us in the ass
    # The issue here is that the kernel size should vary depending on the raster latitude and proj
    # for now we will assume that the error for high lat rasters is ok, but we should explore a fix.
    if orig_crs.is_geographic:
        y_size_km = -transform[4] * 111  # 1 degree ~~ 111 km at ecuator
    else:  # TODO: check if non geographic crs have transform values in meters
        y_size_km = -transform[4] / 1000  # transform is in meters, convert to km
    radius_in_pixels = int(radius // y_size_km)
    # ksize takes the diameter so multiply radius by 2
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, ksize=(radius_in_pixels * 2, radius_in_pixels * 2))

    # apply the buffer using opencv filter function.
    # It calculates the cross-correlation instead of the convolution, but
    # since we are using a symmetric kernel, it does not matter.
    # Also, it is 100x faster than scipy's convolve ¯\_(ツ)_/¯
    res_buff = cv2.filter2D(arr, ddepth=-1, kernel=kernel) / np.sum(kernel)

    meta.update({"compress": "deflate"})
    with rio.open(out_file, "w", **meta) as dest:
        dest.write(res_buff[np.newaxis, :])


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("file", help="Raster file to apply the kernel")
    parser.add_argument("out", help="Output file name")
    parser.add_argument("--radius", help="Kernel radius in km", default=50)
    args = parser.parse_args()
    main(args.file, args.out, args.radius)
