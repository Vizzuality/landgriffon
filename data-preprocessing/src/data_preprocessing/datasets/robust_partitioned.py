import operator
from collections.abc import Callable
from copy import deepcopy
from typing import Any, Literal

from cachetools import cachedmethod
from kedro.io.catalog_config_resolver import CREDENTIALS_KEY
from kedro.io.core import (
    VERSION_KEY,
    VERSIONED_FLAG_KEY,
    AbstractDataset,
    DatasetError,
    parse_dataset_definition,
)
from kedro_datasets.partitions import PartitionedDataset
from kedro_datasets.partitions.partitioned_dataset import (
    KEY_PROPAGATION_WARNING,
    _grandparent,
)

COMPLETE_MISSING = "complete_missing"
OVERWRITE = "overwrite"


class RobustPartitionedDataset(PartitionedDataset):
    DEFAULT_CHECKPOINT_FILENAME = "_MANIFEST"
    DEFAULT_CHECKPOINT_TYPE = "kedro_datasets.text.TextDataset"

    def __init__(
        self,
        *,
        path: str,
        dataset: str | type[AbstractDataset] | dict[str, Any],
        behavior: Literal["default", "complete_missing", "overwrite"] | None = "default",
        checkpoint: dict[str, Any] | None = None,
        filepath_arg: str = "filepath",
        filename_suffix: str = "",
        credentials: dict[str, Any] | None = None,
        load_args: dict[str, Any] | None = None,
        fs_args: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ):
        """
        RobustPartitionedDataset is a subclass of PartitionedDataset that adds some robustness
        for processing large datasets. Errors saving individual partitions will not prevent the
        rest of the partitions from being processed. A manifest file of completed partitions will
        be saved, and you can skip processing partitions that have already been saved by using the
        behavior: "complete_missing" keyword argument.
        Args:
            behavior: 'default' | 'complete_missing' | 'overwrite'
                The behavior to use when saving partitions.
                'default': Save all partitions, overwriting any that already exist.
                'complete_missing': Only save partitions that do not already exist.
                'overwrite': Delete all partitions before saving.
        """
        super().__init__(
            path=path,
            dataset=dataset,
            filepath_arg=filepath_arg,
            filename_suffix=filename_suffix,
            credentials=credentials,
            load_args=load_args,
            fs_args=fs_args,
            metadata=metadata,
        )
        self._checkpoint_config = self._parse_checkpoint_config(checkpoint)
        self._behavior = behavior
        self._completed_partitions = []

    @property
    def _checkpoint(self) -> AbstractDataset:
        type_, kwargs = parse_dataset_definition(self._checkpoint_config)
        return type_(**kwargs)  # type: ignore

    def _read_checkpoint_ids(self) -> list[str]:
        try:
            return self._checkpoint.load().splitlines()
        except DatasetError:
            return []

    def _parse_checkpoint_config(self, checkpoint_config: dict[str, Any] | None) -> dict[str, Any]:
        checkpoint_config = deepcopy(checkpoint_config)
        checkpoint_config = checkpoint_config or {}

        for key in {VERSION_KEY, VERSIONED_FLAG_KEY} & checkpoint_config.keys():
            raise DatasetError(
                f"'{self.__class__.__name__}' does not support versioning of the "
                f"checkpoint. Please remove '{key}' key from the checkpoint definition."
            )

        default_checkpoint_path = self._sep.join(
            [self._normalized_path.rstrip(self._sep), self.DEFAULT_CHECKPOINT_FILENAME]
        )
        default_config = {
            "type": self.DEFAULT_CHECKPOINT_TYPE,
            self._filepath_arg: default_checkpoint_path,
        }
        if self._credentials:
            default_config[CREDENTIALS_KEY] = deepcopy(self._credentials)

        if CREDENTIALS_KEY in default_config.keys() & checkpoint_config.keys():
            self._logger.warning(
                KEY_PROPAGATION_WARNING,
                {"keys": CREDENTIALS_KEY, "target": "checkpoint"},
            )

        return {**default_config, **checkpoint_config}

    @cachedmethod(cache=operator.attrgetter("_partition_cache"))
    def _list_partitions(self) -> list[str]:
        checkpoint_path = self._filesystem._strip_protocol(
            self._checkpoint_config[self._filepath_arg]
        )
        dataset_is_versioned = VERSION_KEY in self._dataset_config
        checkpoint_ids = self._read_checkpoint_ids()

        def _is_valid_partition(partition) -> bool:
            if not partition.endswith(self._filename_suffix):
                return False
            if partition == checkpoint_path:
                return False
            return not (checkpoint_ids and self._path_to_partition(partition) not in checkpoint_ids)

        return [
            _grandparent(path) if dataset_is_versioned else path
            for path in self._filesystem.find(self._normalized_path, **self._load_args)
            if _is_valid_partition(path)
        ]

    def _load(self) -> dict[str, Callable[[], Any]]:
        partitions = {}

        for partition in self._list_partitions():
            kwargs = deepcopy(self._dataset_config)
            # join the protocol back since PySpark may rely on it
            kwargs[self._filepath_arg] = self._join_protocol(partition)
            dataset = self._dataset_type(**kwargs)  # type: ignore
            partition_id = self._path_to_partition(partition)
            partitions[partition_id] = dataset.load

        if not partitions:
            raise DatasetError(f"No partitions found in '{self._path}'")

        return partitions

    def _save_checkpoint(self, checkpoint_ids: list[str]) -> None:
        self._checkpoint.save("\n".join(sorted(checkpoint_ids)))

    def _save_new_partitions(self, data: dict[str, Callable[[], Any]]) -> None:
        def _save_partition(partition_data, dataset):
            if callable(partition_data):
                partition_data = partition_data()
            dataset.save(partition_data)

        errors = []
        for partition_id, partition_data in data.items():
            kwargs = deepcopy(self._dataset_config)
            partition = self._partition_to_path(partition_id)
            kwargs[self._filepath_arg] = self._join_protocol(partition)
            dataset = self._dataset_type(**kwargs)

            try:
                _save_partition(partition_data, dataset)
                self._completed_partitions.append(partition_id)
            except Exception as e:
                self._logger.warning(f"Error saving partition {partition_id}:\n{e}")
                errors.append(e)

        if errors:
            raise DatasetError(f"{len(errors)} errors occurred while saving partitions.")

    def _save(self, data: dict[str, Callable[[], Any]]) -> None:
        new_partitions = data.keys()
        checkpoint_ids = []

        if self._behavior == COMPLETE_MISSING:
            checkpoint_ids = self._read_checkpoint_ids()
            new_partitions = set(data.keys()) - set(checkpoint_ids)
            self._logger.info(
                f"Saving {self._path}: {len(data.keys()) - len(new_partitions)} of {len(data.keys())} partitions already exist."
            )
        elif self._behavior == OVERWRITE and self._filesystem.exists(self._normalized_path):
            self._filesystem.rm(self._normalized_path, recursive=True)

        if not len(new_partitions):
            return
        if not self._filesystem.exists(self._normalized_path):
            self._filesystem.mkdir(self._normalized_path)

        self._completed_partitions = checkpoint_ids
        try:
            self._save_new_partitions({k: data[k] for k in new_partitions})
        except (KeyboardInterrupt, Exception) as e:
            self._logger.info("Saving checkpoint on Exception")
            self._save_checkpoint(self._completed_partitions)
            raise e
        self._save_checkpoint(self._completed_partitions)
        self._invalidate_caches()
