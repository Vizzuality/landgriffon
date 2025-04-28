# Landgriffon data preprocessing

[![Powered by Kedro](https://img.shields.io/badge/powered_by-kedro-ffc900?logo=kedro)](https://kedro.org)

## Overview
This module manages all the transformation and loading of data from source to instance database.

Landgriffon is conceptualized around two main concepts: materials and indicators.

A _material_ is any good that is geolocated and quantified in the application for users to represent a quantity of land
used to produce a unit or the quantity of mass units of the represented material. Landgriffon has a set of default materials.

An _indicator_ is a measure that quantifies or can be related to an environmental impact. Those are used to

### Materials

The data structures for material consists of

## Development

### Install dependencies

This python module uses `uv` to manage dependencies.

To create an environment with all the dependencies (including development ones), run:

```
uv sync
```

Check dependency groups for specific dependencies for different functionalities like compiling the `docs`

### Testing

```
pytest
```

To configure the coverage threshold, look at the `.coveragerc` file.

### How to run your Kedro pipelines

You can run all the pipelines with:

```
kedro run
```

or using the generated cli entrypoint that aliases `kedro run`

```
data-preprocessing
```

#### Run a single pipeline

```
kedro run --pipeline <pipeline_name>
```

#### Run a subset of pipelines or nodes with **tags**

```
kedro run --tags tag1 --tags tag2
```
