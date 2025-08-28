import numpy as np
import pytest
import rasterio
import xarray as xr


@pytest.fixture
def dummy_raster() -> xr.DataArray:
    w, h = 2, 2
    data = np.ones((1, w, h))
    transform = rasterio.transform.from_origin(0, 0, 0.08, 0.08)
    raster = xr.DataArray(data, dims=("band", "y", "x"))
    raster = raster.rio.write_crs("EPSG:4326")
    raster = raster.rio.write_transform(transform)
    return raster
