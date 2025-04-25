import concurrent.futures
from collections.abc import Callable
from copy import deepcopy
from typing import Any, Literal

from kedro.io.core import (
    AbstractDataset,
    DatasetError,
)

from data_preprocessing.datasets.robust_partitioned import RobustPartitionedDataset


class MultiprocessingPartitionedDataset(RobustPartitionedDataset):
    DEFAULT_CHECKPOINT_FILENAME = "_MANIFEST"

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
        """The MultiprocessingPartitionedDataset is a subclass of PartitionedDataset that
        uses a ProcessPoolExecutor to process and save partitions in parallel.
        MultiprocessingPartitionedDataset adds some robustness for processing large datasets.
        Errors saving individual partitions will not prevent the rest of the
        partitions from being processed. A manifest file of completed partitions
        will be saved, and you can skip processing partitions that have already
        been saved by using the behavior:"complete_missing" keyword argument.
        Args:
            dask_client_options: Options to pass to the Dask Client constructor
                to configure the connection to the Dask cluster.
                e.g. {'address': 'http://localhost:8786'}
                If no address is specificed, Dask will initiate a LocalCluster
                to execute tasks, and keyword arguments will be passed to the
                LocalCluster constructor.
            behavior: 'default' | 'complete_missing' | 'overwrite'
                The behavior to use when saving partitions.
                'default': Save all partitions, overwriting any that already exist.
                'complete_missing': Only save partitions that do not already exist.
                'overwrite': Delete all partitions before saving.
        """
        super().__init__(
            path=path,
            dataset=dataset,
            behavior=behavior,
            checkpoint=checkpoint,
            filepath_arg=filepath_arg,
            filename_suffix=filename_suffix,
            credentials=credentials,
            load_args=load_args,
            fs_args=fs_args,
            metadata=metadata,
        )

    def _save_new_partitions(self, data: dict[str, Callable[[], Any]]) -> None:
        def _save_partition(partition_data, dataset):
            if callable(partition_data):
                partition_data = partition_data()
            dataset.save(partition_data)

        errors = []

        with concurrent.futures.ProcessPoolExecutor() as pool:
            futures_to_ids = {}
            futures = []
            for partition_id, partition_data in data.items():
                kwargs = deepcopy(self._dataset_config)
                partition = self._partition_to_path(partition_id)
                kwargs[self._filepath_arg] = self._join_protocol(partition)
                dataset = self._dataset_type(**kwargs)
                future = pool.submit(_save_partition, partition_data, dataset)
                futures.append(future)
                futures_to_ids[future] = partition_id

            for future in concurrent.futures.as_completed(futures):
                try:
                    future.result()
                    self._completed_partitions.append(futures_to_ids[future])
                except Exception as e:
                    errors.append(e)
                    self._logger.warning(
                        f"Error saving partition {futures_to_ids[future]}, with exception: {e.__repr__()}"
                    )

        if errors:
            raise DatasetError(f"{len(errors)} errors occurred while saving partitions.")
