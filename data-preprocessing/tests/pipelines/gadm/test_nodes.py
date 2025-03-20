import polars as pl

from data_preprocessing.pipelines.gadm.nodes import _last_non_null_gadm_level


def test_last_meaningful_gadm_level__w_gid_1_level():
    df = pl.DataFrame(
        {
            "GID_0": "AFG",
            "GID_1": "AFG.1_1",
            "GID_2": None,
            "NAME_0": "afga",
            "NAME_1": "foo",
            "NAME_2": None,
        }
    )
    df = df.with_columns(test=_last_non_null_gadm_level("GID"))
    assert df.select("test").item() == "AFG.1"


def test__last_meaningful_gadm_level__w_gid_2_levels():
    df = pl.DataFrame(
        {
            "GID_0": "AFG",
            "GID_1": "AFG.1",
            "GID_2": "AFG.1.2_3",
            "NAME_0": "afga",
            "NAME_1": "foo",
            "NAME_2": "bar",
        }
    )
    df = df.with_columns(test=_last_non_null_gadm_level("GID"))
    assert df.select("test").item() == "AFG.1.2"


def test_last_meaningful_gadm_level__w_name_1_level():
    df = pl.DataFrame(
        {
            "GID_0": "AFG",
            "GID_1": "AFG.1_1",
            "GID_2": None,
            "NAME_0": "afga",
            "NAME_1": "foo",
            "NAME_2": None,
        }
    )
    df = df.with_columns(test=_last_non_null_gadm_level("NAME"))
    assert df.select("test").item() == "foo"
