import numpy as np
import polars as pl
import pytest
import rasterio
import rioxarray  # noqa: F401
import xarray as xr
from polars.testing import assert_frame_equal

from data_preprocessing.pipelines.spam.nodes import _raster_to_h3, join_h3_table


@pytest.fixture
def dummy_raster() -> xr.DataArray:
    w, h = 2, 2
    data = np.ones((w, h, 1))
    transform = rasterio.transform.from_origin(0, 0, 0.08, 0.08)
    raster = xr.DataArray(data, dims=("y", "x", "band"))
    raster = raster.rio.write_crs("EPSG:4326")
    raster = raster.rio.write_transform(transform)
    return raster


def test__raster_to_h3(dummy_raster):
    res = _raster_to_h3(dummy_raster, h3_res=6)
    assert_frame_equal(
        res,
        pl.DataFrame(
            {
                "value": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
                "cell": [
                    605545759865044991,
                    605545759999262719,
                    605545760401915903,
                    605545760536133631,
                    605545760670351359,
                    605545761744093183,
                ],
            },
            schema={"value": pl.Float64, "cell": pl.UInt64},
        ),
    )


def test__raster_to_h3_bad_res_raises(dummy_raster):
    with pytest.raises(ValueError) as exc_info:
        _raster_to_h3(dummy_raster, h3_res=10)
        assert "H3 resolution is not correct" in str(exc_info.value)


def test_join_h3_table():
    tables = {
        "col1": lambda: pl.DataFrame({"cell": [11], "value": [1]}),
        "col2": lambda: pl.DataFrame({"cell": [22], "value": [2]}),
    }
    res = join_h3_table(tables)
    assert_frame_equal(
        res,
        pl.DataFrame({"cell": [11, 22], "col1": [1, None], "col2": [None, 2]}),
        check_column_order=False,
    )
