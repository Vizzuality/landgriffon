import json
import logging
import os
from pathlib import Path
from re import sub

import jsonschema
import pandas as pd
import psycopg
from jsonschema import ValidationError
from psycopg2 import sql
from psycopg2.extensions import connection

log = logging.getLogger(__name__)  # here we can use __name__ because it is an imported module

DTYPES_TO_PG = {
    "boolean": "bool",
    "uint8": "smallint",
    "uint16": "int",
    "uint32": "bigint",
    "uint64": "bigint",
    "int8": "smallint",
    "int16": "smallint",
    "int32": "int",
    "int64": "bigint",
    "float32": "real",
    "float64": "double precision",
}


def slugify(s):
    # TODO: IS THIS NECESSARY? FIND A PACKAGE THAT DOES IT
    s = sub(r"[_-]+", " ", s).title().replace(" ", "")
    return "".join([s[0].lower(), s[1:]])


def snakify(s):
    return sub(r"(?<!^)(?=[A-Z])", "_", s).lower()


def get_contextual_layer_category_enum(conn: connection) -> set:
    """Get the enum of contextual layer categories"""

    with conn.cursor() as cursor:
        cursor.execute("SELECT unnest(enum_range(NULL::contextual_layer_category));")
        values = set(r[0] for r in cursor.fetchall())
    return values


def insert_to_h3_data_and_contextual_layer_tables(
    table: str,
    column: str,
    h3_res: int,
    dataset: str,
    category: str,
    year: int,
    connection: connection,
):
    categories_enum = get_contextual_layer_category_enum(connection)
    if category not in categories_enum:
        log.error(f"Category '{category}' not supported. Supported categories: {categories_enum}")
        return

    with connection:
        with connection.cursor() as cursor:
            # remove existing entries
            cursor.execute('DELETE FROM "h3_data" WHERE "h3tableName" = (%s)', (table,))
            cursor.execute('DELETE FROM "contextual_layer" WHERE "name" = (%s)', (dataset,))

            # insert new entries
            log.info("Inserting record into h3_data table...")
            h3_data_query = sql.SQL(
                """
                INSERT INTO "h3_data" ("h3tableName", "h3columnName", "h3resolution", "year")
                VALUES ({table}, {column}, {h3_res}, {year})
                """
            ).format(
                table=sql.Identifier(table),
                column=sql.Identifier(column),
                h3_res=sql.Literal(h3_res),
                year=sql.Literal(year),
            )
            cursor.execute(h3_data_query)

            log.info("Inserting record into contextual_layer table...")
            metadata = json.dumps(get_metadata(table))
            insert_query = sql.SQL(
                """
                INSERT INTO "contextual_layer" ("name", "metadata", "category")
                VALUES ({dataset}, {metadata}, {category})
                RETURNING id;
            """
            ).format(dataset=sql.Literal(dataset), metadata=sql.Literal(metadata), category=sql.Literal(category))
            cursor.execute(insert_query)
            contextual_data_id = cursor.fetchall()[0][0]
            update_query = sql.SQL(
                """
                UPDATE "h3_data" SET "contextualLayerId" = {contextual_data_id}
                WHERE "h3tableName" = {table};
            """
            ).format(contextual_data_id=sql.Literal(contextual_data_id), table=sql.Identifier(table))
            cursor.execute(update_query)


def get_metadata(table: str) -> dict:
    """Returns the metadata for the given table"""
    metadata_base_path = Path(__file__).parent / "contextual_layers_metadata"
    # load the json schema
    with open(metadata_base_path / "contextual_metadata_schema.json") as f:
        schema = json.load(f)

    metadata_path = metadata_base_path / f"{table}_metadata.json"

    if not metadata_path.exists():
        log.error(f"No metadata found for {table} with the name {metadata_path.name}")
        # todo: should we raise exception or return empty metadata and keep going?
        raise FileNotFoundError(f"Metadata file {metadata_path.name} not found")

    with open(metadata_path, "r") as f:
        metadata = json.load(f)
        try:
            jsonschema.validate(metadata, schema)
        except ValidationError as e:
            log.error(f"Metadata for {table} is not valid: {e}")
            # todo: should we raise exception or return empty metadata and keep going?
            raise e
        return metadata


def link_to_indicator_table(connection: connection, indicator_code: str, h3_column_name: str):
    """Gets indicatorID and links it to the h3table corresponding entry"""
    with connection:
        with connection.cursor() as cursor:
            cursor.execute(f"""select id from "indicator" where "nameCode" = '{indicator_code}'""")
            indicator_id = cursor.fetchall()[0][0]
            if indicator_id:
                cursor.execute(
                    f"""update "h3_data"  set "indicatorId" = '{indicator_id}'
                    where  "h3columnName" = '{h3_column_name}'"""
                )
                log.info(f"Updated indicatorId '{indicator_id}' in h3_data for {h3_column_name}")
            else:
                log.error(f"Indicator with name code {indicator_code} does not exist")


def get_connection_info() -> str:
    """Returns a connection info string for psycopg based on env variables"""
    return psycopg.conninfo.make_conninfo(
        host=os.getenv("API_POSTGRES_HOST"),
        port=os.getenv("API_POSTGRES_PORT"),
        user=os.getenv("API_POSTGRES_USERNAME"),
        password=os.getenv("API_POSTGRES_PASSWORD"),
    )


def h3_table_schema(df: pd.DataFrame) -> sql.Composable:
    """Construct an SQL schema for an H3 table from a pandas DataFrame
    TODO: make this func used everywhere and carefull with psycpg version
    Examples:
        >>> schema = h3_table_schema(df)
        >>> sql.SQL("CREATE TABLE {} ({})").format(sql.Identifier(table), schema)
    """
    index = [sql.SQL("h3index h3index PRIMARY KEY")]
    extra = [
        sql.SQL("{} {}").format(sql.Identifier(col), sql.SQL(DTYPES_TO_PG[str(dtype)]))
        for col, dtype in zip(df.columns, df.dtypes)
    ]
    schema = sql.SQL(", ").join(index + extra)
    return schema
