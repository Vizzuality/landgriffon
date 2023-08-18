import logging
import os
from io import StringIO
from pathlib import Path

import click
import pandas as pd
from psycopg2.extensions import connection
from psycopg2.pool import ThreadedConnectionPool

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("indicator_coefficient_importer")

postgres_thread_pool = ThreadedConnectionPool(
    1,
    50,
    host=os.getenv("API_POSTGRES_HOST"),
    port=os.getenv("API_POSTGRES_PORT"),
    user=os.getenv("API_POSTGRES_USERNAME"),
    password=os.getenv("API_POSTGRES_PASSWORD"),
)


def load_data(filename: Path, year: int) -> pd.DataFrame:
    dtype_mapping = {"hs_2017_code": str}
    df = pd.read_csv(filename, dtype=dtype_mapping)
    df["year"] = year
    return df


def get_admin_region_ids_from_countries(conn, countries: list) -> pd.DataFrame:
    with conn.cursor() as cur:
        cur.execute(
            """select id, name from admin_region ar where ar.name = any(%s);""",
            (countries,),
        )
        return pd.DataFrame.from_records(
            cur.fetchall(), columns=["adminRegionId", "country"]
        )


def get_material_ids_from_hs_codes(conn, hs_codes: list) -> pd.DataFrame:
    with conn.cursor() as cur:
        cur.execute(
            """select id, "hsCodeId" from material m where m."hsCodeId" = any(%s)""",
            (hs_codes,),
        )
        return pd.DataFrame.from_records(
            cur.fetchall(), columns=["materialId", "hs_2017_code"]
        )


def copy_data_to_table(conn: connection, df: pd.DataFrame, indicator_id: str):
    """
    Copy data from a string buffer to a database table.
    It deletes all existing rows for the given indicatorId before inserting the new ones.
    """
    # save dataframe to an in memory buffer

    buffer = StringIO()
    df.to_csv(buffer, index=False, header=False, na_rep="NULL")
    buffer.seek(0)
    with conn:
        with conn.cursor() as cursor:
            cursor.execute(
                'delete from indicator_coefficient where "indicatorId" = %s',
                (indicator_id,),
            )
            log.info(f"Copying {len(df)} records into indicator_coefficient...")
            cursor.copy_from(
                buffer,
                "indicator_coefficient",
                sep=",",
                columns=df.columns,
                null="NULL",
            )
    log.info("Done!")


@click.command()
@click.argument("file", type=click.Path(exists=True, path_type=Path))
@click.argument("indicator_code", type=str)
@click.argument("year", type=int)
def main(file: Path, indicator_code: str, year: int):
    """Process and ingest csv data with per country data into indicator_coefficient table."""
    data = load_data(file, year)

    conn = postgres_thread_pool.getconn()

    with conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """select id from indicator where indicator."nameCode" = %s;""",
                (indicator_code,),
            )
            indicator_id = cursor.fetchone()[0]
        # add admin region ID to dataframe so we can insert all rows at once
        # without having to query for the IDs every time
        admin_region_ids = get_admin_region_ids_from_countries(
            conn, list(data.country.unique())
        )
        # same with material ID
        material_ids = get_material_ids_from_hs_codes(
            conn, data.hs_2017_code.astype(str).to_list()
        )

    data = pd.merge(data, admin_region_ids, on="country", how="left")
    data = pd.merge(data, material_ids, on="hs_2017_code", how="left")
    data["indicatorId"] = indicator_id
    data_to_insert = data[
        ["value", "year", "adminRegionId", "indicatorId", "materialId"]
    ]
    copy_data_to_table(conn, data_to_insert, indicator_id)
    postgres_thread_pool.putconn(conn, close=True)


if __name__ == "__main__":
    main()
