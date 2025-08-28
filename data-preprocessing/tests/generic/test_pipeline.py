import logging

from kedro.io import KedroDataCatalog
from kedro.runner import SequentialRunner

from data_preprocessing.generic.pipeline import raster_pipeline


def test_generic_raster_pipeline(dummy_raster, caplog):
    catalog = KedroDataCatalog()

    catalog["raw"] = dummy_raster
    catalog["params:resampling_method"] = "average"
    catalog["params:h3_resolution"] = 6
    catalog["params:raster_resolution"] = 0.5

    caplog.set_level(logging.DEBUG, logger="kedro")
    successful_run_msg = "Pipeline execution completed successfully."
    SequentialRunner().run(raster_pipeline, catalog)
    assert successful_run_msg in caplog.text
