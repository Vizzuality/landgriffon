from kedro.pipeline import node, pipeline

from data_preprocessing.generic.nodes import raster_to_h3, resample_raster

raster_pipeline = pipeline(
    [
        node(
            resample_raster, ["raw", "params:resolution", "params:resampling_method"], "resampled"
        ),
        node(raster_to_h3, ["resampled", "params:h3_resolution"], "h3_table"),
    ]
)
