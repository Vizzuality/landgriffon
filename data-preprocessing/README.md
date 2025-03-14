# Landgriffon data preprocessing

[![Powered by Kedro](https://img.shields.io/badge/powered_by-kedro-ffc900?logo=kedro)](https://kedro.org)

## Overview


Take a look at the [Kedro documentation](https://docs.kedro.org) to get started.

## How to install dependencies

This python module uses `uv` to manage dependencies.

To create an environment with all the dependencies (including development ones), run:

```
uv sync
```


## How to run your Kedro pipeline

You can run all the pipelines with:

```
kedro run
```

or simply

```
data-preprocessing
```

## How to test

```
pytest
```

To configure the coverage threshold, look at the `.coveragerc` file.
