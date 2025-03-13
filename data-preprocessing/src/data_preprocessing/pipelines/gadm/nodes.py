import logging
import uuid

import geopandas as gpd
import pandas as pd
from h3ronpy import cells_to_string, compact
from h3ronpy.pandas.vector import geoseries_to_cells

log = logging.getLogger(__name__)


def gadm_to_h3(gdf: gpd.GeoDataFrame, h3_resolution: int) -> pd.DataFrame:
    log.info("Converting GADM data to H3")
    gdf["h3Flat"] = geoseries_to_cells(gdf["geometry"], resolution=h3_resolution, compact=False)
    log.info("Compacting H3 cells")
    gdf["h3Compact"] = [compact(arr).to_numpy() for arr in gdf["h3Flat"]]
    log.info("Converting H3 cells to hex strings")
    gdf["h3Compact"] = gdf["h3Compact"].apply(lambda arr: cells_to_string(arr).to_numpy())
    gdf["h3Flat"] = gdf["h3Flat"].apply(lambda arr: cells_to_string(arr).to_numpy())
    gdf["h3FlatLength"] = gdf["h3Flat"].apply(lambda x: len(x))

    # breakpoint()
    # convert h3 lists to sql literal arrays
    gdf["h3Compact"] = gdf["h3Compact"].apply(lambda x: f"{{{','.join(e for e in x)}}}")
    gdf["h3Flat"] = gdf["h3Flat"].apply(lambda x: f"{{{','.join(e for e in x)}}}")

    log.info("Serializing geometries to WKB")
    df = gdf.to_wkb(hex=True)
    df = df.rename(columns={"geometry": "theGeom"})

    df["id"] = [str(uuid.uuid4()) for _ in range(len(df))]
    return df
