import numpy as np
import polars as pl
import pytest
import rasterio
import xarray as xr
from polars.testing import assert_frame_equal

from data_preprocessing.generic.nodes import raster_to_h3, resample_raster


@pytest.fixture
def dummy_raster() -> xr.DataArray:
    w, h = 2, 2
    data = np.ones((1, w, h))
    transform = rasterio.transform.from_origin(0, 0, 0.08, 0.08)
    raster = xr.DataArray(data, dims=("band", "y", "x"))
    raster = raster.rio.write_crs("EPSG:4326")
    raster = raster.rio.write_transform(transform)
    return raster


def test_resample_raster(dummy_raster):
    res = resample_raster(dummy_raster, 0.1, "average")
    assert res.rio.resolution() == (0.1, -0.1)


def test_resample_raster_bad_method(dummy_raster):
    with pytest.raises(ValueError):
        resample_raster(dummy_raster, 0.1, "fooo")


def test_raster_to_h3(dummy_raster):
    res = raster_to_h3(dummy_raster, h3_resolution=6)
    assert_frame_equal(
        res,
        pl.DataFrame(
            {
                "value": np.ones(12),
                "cell": [
                    605545759865044991,
                    605545759999262719,
                    605545760401915903,
                    605545760536133631,
                    605545760670351359,
                    605545761475657727,
                    605545761744093183,
                    605546007899406335,
                    605546008033624063,
                    605546008167841791,
                    605546008302059519,
                    605546008704712703,
                ],
            },
            schema={"value": pl.Float64, "cell": pl.UInt64},
        ),
    )


def test_raster_to_h3_bad_res_raises(dummy_raster):
    with pytest.raises(ValueError) as exc_info:
        raster_to_h3(dummy_raster, h3_resolution=10)
        assert "H3 resolution is not correct" in str(exc_info.value)
