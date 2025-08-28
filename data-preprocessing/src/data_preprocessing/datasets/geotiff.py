import logging
from copy import deepcopy
from pathlib import PurePosixPath
from typing import Any, ClassVar

import fsspec
import rasterio
import rioxarray
import xarray
from kedro.io import AbstractVersionedDataset
from kedro.io.core import Version, get_filepath_str, get_protocol_and_path
from rasterio import CRS

logger = logging.getLogger(__name__)

SUPPORTED_DIMS = [("band", "x", "y"), ("x", "y")]
DEFAULT_NO_DATA_VALUE = -9999
SUPPORTED_FILE_FORMATS = [".tif", ".tiff"]


class GeoTIFFDataset(AbstractVersionedDataset):
    DEFAULT_LOAD_ARGS: ClassVar[dict[str, Any]] = {}
    DEFAULT_SAVE_ARGS: ClassVar[dict[str, Any]] = {}
    DEFAULT_FS_ARGS: ClassVar[dict[str, Any]] = {"open_args_save": {"mode": "w"}}

    def __init__(
        self,
        *,
        filepath: str,
        load_args: dict[str, Any] | None = None,
        save_args: dict[str, Any] | None = None,
        version: Version | None = None,
        credentials: dict[str, Any] | None = None,
        fs_args: dict[str, Any] | None = None,
    ):
        _fs_args = deepcopy(fs_args) or {}
        _fs_open_args_load = _fs_args.pop("open_args_load", {})
        _fs_open_args_save = _fs_args.pop("open_args_save", {})

        _credentials = deepcopy(credentials) or {}
        protocol, path = get_protocol_and_path(filepath, version)

        self._protocol = protocol
        if protocol == "file":
            _fs_args.setdefault("auto_mkdir", True)
        self._fs = fsspec.filesystem(self._protocol, **_credentials, **_fs_args)

        super().__init__(
            filepath=PurePosixPath(path),
            version=version,
            exists_function=self._fs.exists,
            glob_function=self._fs.glob,
        )

        # Handle default save and fs arguments
        self._save_args = {**self.DEFAULT_SAVE_ARGS, **(save_args or {})}
        self._load_args = {**self.DEFAULT_LOAD_ARGS, **(load_args or {})}

        self._fs_open_args_load = {
            **self.DEFAULT_FS_ARGS.get("open_args_load", {}),
            **(_fs_open_args_load or {}),
        }
        self._fs_open_args_save = {
            **self.DEFAULT_FS_ARGS.get("open_args_save", {}),
            **(_fs_open_args_save or {}),
        }

    def _describe(self) -> dict[str, Any]:
        return {
            "filepath": self._filepath,
            "protocol": self._protocol,
            "load_args": self._load_args,
            "save_args": self._save_args,
            "version": self._version,
        }

    def save(self, data: xarray.DataArray) -> None:
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

    def _sanity_check(self, data: xarray.DataArray) -> None:
        """Perform sanity checks on the data to ensure it meets the requirements."""
        if not isinstance(data, xarray.DataArray):
            raise NotImplementedError(
                "Currently only supporting xarray.DataArray while saving raster data."
            )

        if not isinstance(data.rio.crs, CRS):
            raise ValueError("Dataset lacks a coordinate reference system.")

        if all(set(data.dims) != set(dims) for dims in SUPPORTED_DIMS):
            raise ValueError(
                f"Data has unsupported dimensions: {data.dims}. Supported dimensions are: {SUPPORTED_DIMS}"
            )
