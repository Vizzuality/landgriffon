import json
import logging
import os
from pathlib import Path

import boto3
import click
import psycopg
from botocore.exceptions import ClientError

from utils import get_connection_info, get_contextual_layer_category_enum, get_metadata

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("cog_to_contextual_layer_linker")


def check_file_exists_in_s3(cog_name: str):
    """Checks that cog_name file exists in the S3 bucket."""
    aws_session = boto3.session.Session(
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"), aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )
    s3 = aws_session.client("s3")
    # TODO: get bucket name from env? hardcoded? Alex help here 🙏
    bucket = os.getenv("S3_BUCKET_NAME")
    try:
        s3.head_object(Bucket=bucket, Key=str(Path(os.getenv("S3_COG_PATH")) / cog_name))
    except ClientError as e:
        log.error(f"{cog_name} not found in S3 bucket")
        raise e


def insert_in_contextuals_table(name, category, metadata, tiler_url, default_params=None) -> str:
    with psycopg.connect(get_connection_info()) as con:
        if category not in get_contextual_layer_category_enum(con):
            log.error(f"Category '{category}' not supported.")
            raise ValueError(f"Category '{category}' not supported.")

        with con.cursor() as cur:
            cur.execute('DELETE FROM "contextual_layer" WHERE "name" = %s', (name,))
            cur.execute(
                'INSERT INTO "contextual_layer"  ("name", "metadata", "category", "tilerUrl", "defaultTilerParams")'
                "VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (name, metadata, category, tiler_url, default_params),
            )
            return cur.fetchone()[0]


@click.command()
@click.option("--cog", type=str, help="Name of the cog in the S3 bucket or URL to external tiler.", required=True)
@click.option(
    "--name",
    type=str,
    required=True,
    help="Name of the contextual layer. Must be unique and the metadata json file with the same name and suffixed "
    "_metadata must exist.",
)
@click.option("--category", type=str, required=True, help="Category of the contextual layer.")
@click.option(
    "--tiler_param", "--tp", type=str, multiple=True, help="Tiler default parameters in the form of key=value."
)
def main(cog: str, name: str, category: str, tiler_param: list):
    """Link a COG to a contextual layer in the database to be used by our own tiler or simply and external tiler url."""
    # List of default tiler query_params. We will use this to create the json field in the contextual_layer table
    query_params = dict(param.split("=") for param in tiler_param)
    if cog.startswith("https://"):
        # External tiler url. We don't need to check if the file exists in S3, nor we need query_params for the tiler
        tiler_url = cog
        entry_id = insert_in_contextuals_table(
            name, category, json.dumps(get_metadata(name)), tiler_url, json.dumps(query_params)
        )
        log.info(f"External tiler {cog} linked to contextual_layer table with id={entry_id}")
    else:
        tiler_url = "/tiler/cog/tiles/{z}/{x}/{y}"
        check_file_exists_in_s3(cog)
        query_params["url"] = cog
        entry_id = insert_in_contextuals_table(
            name, category, json.dumps(get_metadata(name)), tiler_url, json.dumps(query_params)
        )
        log.info(f"COG {cog} linked to contextual_layer table with id={entry_id}")


if __name__ == "__main__":
    main()
