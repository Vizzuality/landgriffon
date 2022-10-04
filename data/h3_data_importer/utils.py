import json
import logging
from pathlib import Path
from re import sub

import jsonschema
from jsonschema import ValidationError

log = logging.getLogger(__name__)  # here we can use __name__ because it is an imported module


def slugify(s):
    s = sub(r"[_-]+", " ", s).title().replace(" ", "")
    return "".join([s[0].lower(), s[1:]])


def snakify(s):
    return sub(r"(?<!^)(?=[A-Z])", "_", s).lower()


def get_contextual_layer_category_enum(conn) -> set:
    """Get the enum of contextual layer categories"""
    with conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT unnest(enum_range(NULL::contextual_layer_category));")
            values = set(r[0] for r in cursor.fetchall())
    return values


def insert_to_h3_data_and_contextual_layer_tables(
    table: str, column: str, h3_res: int, dataset: str, category: str, year: int, connection
):
    categories_enum = get_contextual_layer_category_enum(connection)
    if category not in categories_enum:
        log.error(f"Category '{category}' not supported. Supported categories: {categories_enum}")
        return

    with connection:
        with connection.cursor() as cursor:
            # remove existing entries
            cursor.execute(f"""DELETE FROM "h3_data" WHERE "h3tableName" = '{table}';""")
            cursor.execute(
                f"""DELETE FROM "contextual_layer" WHERE "name" = '{dataset}'"""
            )

            # insert new entries
            log.info("Inserting record into h3_data table...")

            cursor.execute(
                f"""INSERT INTO "h3_data" ("h3tableName", "h3columnName", "h3resolution", "year")
                 VALUES ('{table}', '{column}', {h3_res}, {year});"""
            )

            log.info("Inserting record into contextual_layer table...")
            cursor.execute(
                f"""INSERT INTO "contextual_layer"  ("name", "metadata", "category")
                 VALUES ('{dataset}', '{json.dumps(get_metadata(table))}', '{category}')
                 RETURNING id;
                """
            )
            contextual_data_id = cursor.fetchall()[0][0]
            # insert contextual_layer entry id into h3_table
            cursor.execute(
                f"""update "h3_data"  set "contextualLayerId" = '{contextual_data_id}' where  "h3tableName" = '{table}';"""
            )


def get_metadata(table: str) -> dict:
    """Returns the metadata for the given table"""
    metadata_base_path = Path(__file__).parent / "contextual_layers_metadata"
    # load the json schema
    with open(metadata_base_path / "contextual_metadata_schema.json") as f:
        schema = json.load(f)

    metadata_path = metadata_base_path / f"{table}_metadata.json"

    if not metadata_path.exists():
        log.error(f"No metadata found for {table}")
        # todo: should we raise exception or return empty metadata and keep going?
        raise FileNotFoundError(f"Metadata file for {table} not found")

    with open(metadata_path, "r") as f:
        metadata = json.load(f)
        try:
            jsonschema.validate(metadata, schema)
        except ValidationError as e:
            log.error(f"Metadata for {table} is not valid: {e}")
            # todo: should we raise exception or return empty metadata and keep going?
            raise e
        return metadata
