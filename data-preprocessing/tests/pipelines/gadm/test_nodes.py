import polars as pl

from data_preprocessing.pipelines.gadm.nodes import add_unified_columns


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
    df = add_unified_columns(df).collect()
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
    df = add_unified_columns(df).collect()
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
    df = add_unified_columns(df).collect()
    assert df.select("gadm_id").item() == "AFG"
    assert df.select("name").item() == "afga"
    assert df.select("level").item() == 0
