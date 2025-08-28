import polars as pl
from polars.testing import assert_series_equal

from data_preprocessing.pipelines.gadm.nodes import (
    _materialized_path,
    _parent_id_column,
    add_unified_columns,
)


def test_add_unified_columns_level_1():
    df = pl.LazyFrame(
        {
            "GID_0": "AFG",
            "GID_1": "AFG.1_1",
            "GID_2": None,
            "NAME_0": "afga",
            "NAME_1": "foo",
            "NAME_2": None,
        }
    )
    df = add_unified_columns(df)
    assert df.select("gadm_id").item() == "AFG.1"
    assert df.select("name").item() == "foo"
    assert df.select("level").item() == 1


def test_add_unified_columns_levels_2():
    df = pl.LazyFrame(
        {
            "GID_0": "AFG",
            "GID_1": "AFG.1",
            "GID_2": "AFG.1.2_3",
            "NAME_0": "afga",
            "NAME_1": "foo",
            "NAME_2": "bar",
        }
    )
    df = add_unified_columns(df)
    assert df.select("gadm_id").item() == "AFG.1.2"
    assert df.select("name").item() == "bar"
    assert df.select("level").item() == 2


def test_add_unified_columns_level_0():
    df = pl.LazyFrame(
        {
            "GID_0": "AFG",
            "GID_1": None,
            "GID_2": None,
            "NAME_0": "afga",
            "NAME_1": None,
            "NAME_2": None,
        }
    )
    df = add_unified_columns(df)
    assert df.select("gadm_id").item() == "AFG"
    assert df.select("name").item() == "afga"
    assert df.select("level").item() == 0


def test_parent_id_level_0():
    df = pl.DataFrame(
        {
            "id": [1, 2, 3, 4, 5, 6],
            "GID_0": ["a", "a", "a", "a", "b", "b"],
            "GID_1": [None, "a.1", "a.1", "a.2", None, "b.1"],
            "GID_2": [None, None, "a.1.1", None, None, None],
            "gadm_id": ["a", "a.1", "a.1.1", "a.2", "b", "b.1"],
            "level": [0, 1, 2, 1, 0, 1],
        }
    )
    df = _parent_id_column(df)
    assert_series_equal(
        df.select("parent_id").to_series(),
        pl.Series("parent_id", [None, 1, 2, 1, None, 5]),
    )


def test_materialized_path():
    df = pl.DataFrame(
        {
            "id": [1, 2, 3, 4, 5, 6],
            "gadm_id": ["a", "a.1", "a.1.1", "a.2", "b", "b.1"],
            "parent_id": [None, 1, 2, 1, None, 5],
        }
    )
    assert_series_equal(
        _materialized_path(df).sort("id").select("mpath").to_series(),
        pl.Series("mpath", ["1", "1.2", "1.2.3", "1.4", "5", "5.6"]),
    )
