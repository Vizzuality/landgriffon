import logging

import rasterio
import rioxarray
import xarray
from kedro.io.core import get_filepath_str
from kedro_datasets_experimental.rioxarray import geotiff_dataset

logger = logging.getLogger(__name__)


class GeoTIFFDataset(geotiff_dataset.GeoTIFFDataset):
    def _save(self, data: xarray.DataArray) -> None:
        self._sanity_check(data)
        save_path = get_filepath_str(self._get_save_path(), self._protocol)
        data.rio.to_raster(save_path, **self._save_args)
        self._fs.invalidate_cache(save_path)

    def load(self) -> xarray.DataArray:
        load_path = get_filepath_str(self._get_load_path(), self._protocol)
        with self._fs.open(load_path) as fs_file:
            with rasterio.open(fs_file) as data:
                tags = data.tags()
            data = rioxarray.open_rasterio(fs_file, **self._load_args)
        data.attrs.update(tags)
        self._sanity_check(data)
        return data
