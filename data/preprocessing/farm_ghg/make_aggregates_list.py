import os
from pathlib import Path

import click
import numpy as np
import psycopg
import rasterio as rio


def get_spam_aggregations() -> list[list[str]]:
    """Get a list of all SPAM ids that form aggregations in the database.

    i.e. the material with the name like 'OcerWhea' is [Ocer, Whea]
    """
    conn_info = psycopg.conninfo.make_conninfo(
        host=os.getenv("API_POSTGRES_HOST"),
        port=os.getenv("API_POSTGRES_PORT"),
        user=os.getenv("API_POSTGRES_USERNAME"),
        password=os.getenv("API_POSTGRES_PASSWORD"),
    )

    with psycopg.connect(conn_info) as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT DISTINCT "datasetId" FROM material WHERE "datasetId" LIKE \'spam_%\';')
            dataset_ids = cur.fetchall()

    # split the ids into their constituent parts of four characters
    spam_ids = [["".join(item) for item in zip(*[iter(s[0][5:])] * 4)] for s in dataset_ids]
    # keep only the ids that are actually aggregations
    return [ids for ids in spam_ids if len(ids) > 1]


def make_ghg_filename(spam_id: str):
    """Make a filename for a GHG raster from a spam id"""
    return f"{spam_id.upper()}_per_t_production.tif"


def aggregate_ghg_rasters(spam_aggregations: list[str], data_dir: Path):
    fnames = [data_dir / make_ghg_filename(spam_id) for spam_id in spam_aggregations]
    rasters = []
    for file in fnames:
        if not file.exists():
            click.echo(
                f" ERROR: File {file} does not exist. Aggregation {spam_aggregations} will be incomplete.", nl=True
            )
            return

        with rio.open(file) as src:
            rasters.append(src.read(1))
            profile = src.profile  # should be the same for all rasters

    outfile = make_ghg_filename("".join(spam_aggregations))
    with rio.open(data_dir / outfile, "w", **profile) as dst:
        dst.write(np.nansum(rasters, 0)[np.newaxis, :])


@click.command()
@click.argument("data-dir", type=click.Path(exists=True, path_type=Path))
def main(data_dir: Path):
    spam_aggregations = get_spam_aggregations()
    with click.progressbar(spam_aggregations, show_eta=False) as bar:
        for aggregation in bar:
            aggregate_ghg_rasters(aggregation, data_dir)


if __name__ == "__main__":
    main()
