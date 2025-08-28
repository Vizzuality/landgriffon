"""Project settings. There is no need to edit this file unless you want to change values
from the Kedro defaults. For further information, including these default values, see
https://docs.kedro.org/en/stable/kedro_project_setup/settings.html."""

import polars
from kedro.config import OmegaConfigLoader
from omegaconf.resolvers import oc

from data_preprocessing.hooks import EnvHook

CONFIG_LOADER_CLASS = OmegaConfigLoader
# Keyword arguments to pass to the `CONFIG_LOADER_CLASS` constructor.
CONFIG_LOADER_ARGS = {
    "base_env": "base",
    "default_run_env": "local",
    "custom_resolvers": {
        "oc.env": oc.env,  # allow env var interpolation in catalog
        "polars": lambda x: getattr(
            polars, x
        ),  # to inject polars dtypes in catalog for schemas and so
    },
}

# DATA_CATALOG_CLASS = KedroDataCatalog

HOOKS = (EnvHook(),)
