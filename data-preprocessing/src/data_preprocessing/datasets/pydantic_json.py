from copy import deepcopy
from pathlib import PurePosixPath
from typing import Any, ClassVar

import fsspec
from kedro.io.core import AbstractVersionedDataset, Version, get_filepath_str, get_protocol_and_path
from kedro.utils import load_obj
from pydantic import BaseModel

# TODO: get the package name from package?.
_DEFAULT_PACKAGE_NAME = "data_preprocessing"


def load_pydantic_model(class_path: str) -> type[BaseModel]:
    # Try to import from absolute path
    if not class_path.startswith(_DEFAULT_PACKAGE_NAME):
        class_path = _DEFAULT_PACKAGE_NAME + "." + class_path
    model_obj = load_obj(class_path)
    if not issubclass(model_obj, BaseModel):
        raise TypeError(
            f"Invalid data model type: {model_obj}. Must be subclass of pydantic's BaseModel"
        )
    return model_obj


class PydanticJsonDataset(AbstractVersionedDataset[Any, Any]):
    DEFAULT_SAVE_ARGS: ClassVar[dict[str, Any]] = {
        "indent": 2,
        # Use model aliases when serializeing. Mandatory here because of the camelCase names of the
        # json files.
        "by_alias": True,
    }
    DEFAULT_FS_ARGS: ClassVar[dict[str, Any]] = {"open_args_save": {"mode": "w"}}

    def __init__(
        self,
        *,
        filepath: str,
        model: str,
        save_args: dict[str, Any] | None = None,
        version: Version | None = None,
        credentials: dict[str, Any] | None = None,
        fs_args: dict[str, Any] | None = None,
    ) -> None:
        """Creates a new instance of ``PydanticJsonDataset`` pointing to a concrete JSON file
        on a specific filesystem and a Pydantic model for validating its contents.
        """
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
        self._fs_open_args_load = {
            **self.DEFAULT_FS_ARGS.get("open_args_load", {}),
            **(_fs_open_args_load or {}),
        }
        self._fs_open_args_save = {
            **self.DEFAULT_FS_ARGS.get("open_args_save", {}),
            **(_fs_open_args_save or {}),
        }

        # model object loading
        self.model = load_pydantic_model(model)

    def _describe(self) -> dict[str, Any]:
        return {
            "filepath": self._filepath,
            "protocol": self._protocol,
            "save_args": self._save_args,
            "version": self._version,
            "model": self.model,
        }

    def save(self, data: Any) -> None:
        save_path = get_filepath_str(self._get_save_path(), self._protocol)
        with self._fs.open(save_path, **self._fs_open_args_save) as fs_file:
            val_data = self.model.model_validate(data)
            fs_file.write(val_data.model_dump_json(**self._save_args))
        self._invalidate_cache()

    def load(self) -> Any:
        load_path = get_filepath_str(self._get_load_path(), self._protocol)
        with self._fs.open(load_path, **self._fs_open_args_load) as fs_file:
            data = self.model.model_validate_json(fs_file.read())
            return data.model_dump()

    def _invalidate_cache(self) -> None:
        """Invalidate underlying filesystem caches."""
        filepath = get_filepath_str(self._filepath, self._protocol)
        self._fs.invalidate_cache(filepath)
