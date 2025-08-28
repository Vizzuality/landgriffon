# Landgriffon data importing tool

Changes to boost speed and maintainability of the data management in Landgriffon.

## Principles

- Simplify the importing process to have a single entrypoint in a simple program.
- Avoid makefile and shell scripts.
- Separate responsabilities: data loader should digest data in the final format, ie.: h3 table like files like parquet.
- One single source of truth: one simple configuration file in one place.
- Make custom LG instances given a custom configuration.
- Separation between Material (hsCode) and data used to represent the material.

## System changes

**Materials** and **indicators** are a core of the system. The presence/absence of them is dictated by the configration
source files `materials.json` and `indicators.json`. This is the only source of configuration state of the app.
The excel file for user data import is generated programatically in the app based in the instance configuration,
because the configured app is the only source of truth.

Materials are decoupled from specific datasets. The app does not care that the hsCode 102 is made with
the sum of 3 SPAM rasters. If this information matters, then it must come from the data source, not from the app
configuration.


## Data import changes

No more `make`. Everything is managed through a python command line application.

Since data is organized in H3, it should be ingested in H3. Delegate the preprocessing to
another tool or process. Final data sources must be tables as close a possible to final format (like parquet).
