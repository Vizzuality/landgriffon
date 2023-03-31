import json
import logging
import os

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
        s3.head_object(Bucket=bucket, Key=cog_name)
    except ClientError as e:
        log.error(f"{cog_name} not found in S3 bucket")
        raise e


def insert_in_contextuals_table(name, category, metadata, tiler_url, default_params=None):
    with psycopg.connect(get_connection_info()) as con:
        if category not in get_contextual_layer_category_enum(con):
            log.error(f"Category '{category}' not supported.")
            raise ValueError(f"Category '{category}' not supported.")

        with con.cursor() as cur:
            cur.execute('DELETE FROM "contextual_layer" WHERE "name" = %s', (name,))
            cur.execute(
                'INSERT INTO "contextual_layer"  ("name", "metadata", "category", "tilerUrl", "defaultTilerParams")'
                "VALUES (%s, %s, %s, %s, %s)",
                (name, metadata, category, tiler_url, default_params),
            )


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
    # List of default tiler params. We will use this to create the json field in the contextual_layer table
    params = dict(param.split("=") for param in tiler_param)
    if cog.startswith("s3://") or cog.startswith("https://"):
        # External tiler url. We don't need to check if the file exists in S3, nor we need params for the tiler
        log.info(f"Linking external tiler to contextual_layer table...")
        tiler_url = cog
        insert_in_contextuals_table(name, category, json.dumps(get_metadata(name)), tiler_url)
    else:
        log.info(f"Linking cog {cog} to contextual_layer table...")
        # TODO: is this the correct url for all cogs we will have in our own S3?
        tiler_url = "/tiler/cog/tiles/{z}/{x}/{y}"
        # TODO: This always fails :( Alex help here 🙏. but it is really needed?
        # check_file_exists_in_s3(cog)
        # TODO: is this the correct default params field for the cog name?
        params["cog_name"] = cog

        insert_in_contextuals_table(name, category, json.dumps(get_metadata(name)), tiler_url, json.dumps(params))


if __name__ == "__main__":
    main()
