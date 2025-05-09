import numpy as np
import pytest
import rasterio
import rioxarray  # noqa: F401
import xarray as xr

from data_preprocessing.pipelines.spam.nodes import _raster_to_h3


@pytest.fixture
def dummy_raster() -> xr.DataArray:
    w, h = 3, 3
    data = np.ones((w, h, 1))
    transform = rasterio.transform.from_origin(0, 0.3, 0.1, 0.1)
    raster = xr.DataArray(data, dims=("y", "x", "band"))
    raster = raster.rio.write_crs("EPSG:4326")
    raster = raster.rio.write_transform(transform)
    return raster


def test__raster_to_h3(dummy_raster):
    res = _raster_to_h3(dummy_raster, h3_res=6)
    assert res
