import logging

import polars as pl
import rioxarray  # noqa: F401
from h3ronpy.raster import nearest_h3_resolution, raster_to_dataframe
from rasterio.enums import Resampling
from xarray import DataArray


def _parse_resampling(resampling: str) -> Resampling:
    """Parses the resampling method."""
    if (res := Resampling.__members__.get(resampling)) is not None:
        return res
    else:
        raise ValueError(f"Invalid resampling method: {resampling}")


def resample_raster(raster: DataArray, resolution: float, resampling_method: str) -> DataArray:
    """Resamples the raster to the target resolution.

    Args:
        raster: Tuple of (data, metadata).
        resolution: pixel size in crs units
        resampling_method: aggregation method
    Returns:
        Tuple of (data, metadata) of the resampled raster.
    """
    logger = logging.getLogger(__name__)
    logger.info(f"Resampling with {resolution=} and {resampling_method=}")
    return raster.rio.reproject(
        raster.rio.crs,
        resolution=resolution,
        resampling=_parse_resampling(resampling_method),
    )


def raster_to_h3(raster: DataArray, h3_resolution: int) -> pl.DataFrame:
    """Convert a raster to h3 hexagons
    Args:
        raster: raster data.
        h3_resolution: desired h3 resolution
    Returns:
        DataFrame of h3 hexagons with the sampled values.
    """
    nearest_res = nearest_h3_resolution(raster.rio.shape, raster.rio.transform())
    if h3_resolution != nearest_res:
        logger = logging.getLogger(__name__)
        logger.warning(
            f"H3 resolution mismatch: Provided h3 resolution {h3_resolution} differs from computed nearest "
            f"h3 resolution {nearest_res}.\nCheck raster resolution is correct."
        )
    table = raster_to_dataframe(
        raster.to_numpy()[0],
        raster.rio.transform(),
        h3_resolution=h3_resolution,
        nodata_value=raster.rio.nodata,
        compact=False,
    )
    df = pl.DataFrame(pl.from_arrow(table))  # force type to DataFrame
    return df
