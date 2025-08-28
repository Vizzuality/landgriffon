import polars as pl
import rioxarray  # noqa: F401
from polars.testing import assert_frame_equal

from data_preprocessing.pipelines.spam.nodes import join_h3_table


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
