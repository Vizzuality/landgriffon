import polars as pl

from data_preprocessing.pipelines.unsustainable_water_use.nodes import (
    __required_percent_reduction_reference,
    _required_percent_reduction_polars,
)


def test_required_percent_reduction_non_saturated():
    df = pl.DataFrame({"cat": [3], "value": [50]})
    df = df.select(res=_required_percent_reduction_polars("cat", "value"))
    reference = __required_percent_reduction_reference(3, 50)
    assert df.item(0, "res") == reference


def test_required_percent_reduction_saturated():
    df = pl.DataFrame({"cat": [4], "value": [9999]})
    df = df.select(res=_required_percent_reduction_polars("cat", "value"))
    reference = __required_percent_reduction_reference(4, 9999)
    assert df.item(0, "res") == reference
