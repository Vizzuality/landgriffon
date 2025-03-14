import pandas as pd

from data_preprocessing.pipelines.gadm.nodes import _collapse_gid_and_name


def test__collapse_gid_and_name():
    data = pd.Series(
        {
            "GID_0": "AFG",
            "GID_1": "AFG.1_1",
            "NAME_0": "afga",
            "NAME_1": "foo",
        }
    )
    gid, name, level = _collapse_gid_and_name(data)
    assert gid == "AFG.1"
    assert name == "foo"
    assert level == 1


def test__collapse_gid_and_name_w_version():
    data = pd.Series(
        {
            "GID_0": "AFG",
            "GID_1": "AFG.1",
            "GID_2": "AFG.1.2_3",
            "NAME_0": "afga",
            "NAME_1": "foo",
            "NAME_2": "bar",
        }
    )
    gid, name, level = _collapse_gid_and_name(data, remove_version=False)
    assert gid == "AFG.1.2_3"
    assert name == "bar"
    assert level == 2
