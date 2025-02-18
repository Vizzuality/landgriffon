import logging
import sys
from io import StringIO

import fsspec
import polars as pl
import psycopg
from psycopg import sql
from psycopg.errors import OperationalError
from pydantic import BaseModel

from data_importer.config import Settings


class Loader[T: type[BaseModel]]:
    database_uri: str = Settings().database_uri.unicode_string()

    def __init__(self, schema: T, file_path: str):
        self.schema = schema
        self.file_path = file_path

        self.log.info(f"Reading source file from: {self.file_path}")
        with fsspec.open(self.file_path) as f:
            self.data = self.schema.model_validate_json(f.read())
        try:
            with psycopg.connect(self.database_uri):
                pass
        except OperationalError as e:
            self.log.exception(f"Failed to connect to db. {e}")
            sys.exit(1)

    @property
    def log(self):
        return logging.getLogger(__class__.__name__)

    def write_to_db(self, table: str):
        df = pl.DataFrame(self.data.model_dump(mode="json"))
        with psycopg.connect(self.database_uri) as conn, conn.cursor() as cur:
            self.log.info(f"Writing data to {table}")
            with StringIO() as buffer:
                df.write_csv(buffer, include_header=False, null_value="NULL")
                buffer.seek(0)
                copy_query = sql.SQL("COPY {} FROM STDIN DELIMITER ',' CSV NULL 'NULL';").format(
                    sql.Identifier(table)
                )
                self.log.info(f"adding {len(df)} rows to table `{table}`")
                with cur.copy(copy_query) as copy:
                    copy.write(buffer.read())
