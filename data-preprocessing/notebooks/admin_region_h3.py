import marimo

__generated_with = "0.12.4"
app = marimo.App(width="medium")


@app.cell(hide_code=True)
def _():
    import marimo as mo

    return (mo,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""# H3 as administravite boundary error analysis""")
    return


@app.cell
def _():
    import marimo as mo

    return (mo,)


@app.cell
def _():
    import geopandas as gpd
    import numpy as np
    import pandas as pd
    from h3ronpy.h3ronpyrs import ContainmentMode
    from h3ronpy.pandas.vector import geodataframe_to_cells, geoseries_to_cells
    from h3ronpy.vector import geometry_to_cells

    return (
        ContainmentMode,
        geodataframe_to_cells,
        geometry_to_cells,
        geoseries_to_cells,
        gpd,
        np,
        pd,
    )


@app.cell
def _(gpd):
    df = gpd.read_file("data/01_raw/GAUL_2024_L2.zip")
    df.columns
    return (df,)


@app.cell
def _(df):
    len(df)
    return


@app.cell
def _(df):
    df.drop("geometry", axis=1).head()
    return


@app.cell
def _(ContainmentMode, geometry_to_cells, np, pd):
    def over_border(row: pd.Series) -> float:
        geom = row["geometry"]
        boundary_in = geometry_to_cells(
            geom, resolution=6, containment_mode=ContainmentMode.ContainsBoundary
        ).to_numpy()
        centroid_in = geometry_to_cells(
            geom, resolution=6, containment_mode=ContainmentMode.ContainsCentroid
        ).to_numpy()
        if len(centroid_in) == 0:
            return 0
        return len(np.setdiff1d(centroid_in, boundary_in)) / len(centroid_in)

    return (over_border,)


@app.cell
def _(df, over_border):
    df.sample(100).apply(over_border, axis=1).mean()
    return


@app.cell(disabled=True)
def _(df):
    countries = df.dissolve("map_code")
    return (countries,)


@app.cell
def _(countries):
    countries.plot()
    return


@app.cell
def _(countries, over_border):
    countries.iloc[0:5].apply(over_border, axis=1).mean()
    return


@app.cell
def _(countries, over_border):
    countries.loc[countries["iso3_code"] == "ESP"].apply(over_border, axis=1)
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
