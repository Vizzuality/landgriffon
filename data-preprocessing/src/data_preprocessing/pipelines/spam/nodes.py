from collections.abc import Callable

import polars as pl
from h3ronpy.raster import nearest_h3_resolution, raster_to_dataframe
from xarray import DataArray


def to_h3(raster: DataArray) -> pl.DataFrame:
    """Convert a raster to h3 hexagons
    Args:
        raster: raster data.
    Returns:
        DataFrame of h3 hexagons with the sampled values.
    """
    h3_resolution = nearest_h3_resolution(raster.rio.shape, raster.rio.transform())
    table = raster_to_dataframe(
        raster.to_numpy()[0],
        raster.rio.transform(),
        h3_resolution=h3_resolution,
        nodata_value=raster.rio.nodata,
        compact=False,
    )
    df = pl.from_arrow(table)
    return df


def parts_to_h3s(
    spams: dict[str, Callable[[], DataArray]],
) -> dict[str, Callable[[], pl.DataFrame]]:
    """Iterates over the SPAMs in Partitioned dataset and processes them to H3s."""
    h3s = {}
    for name, ds in spams.items():
        h3s[name] = to_h3(ds())
    return h3s
