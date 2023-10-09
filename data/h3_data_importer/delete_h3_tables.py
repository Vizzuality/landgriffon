import logging

import click
import psycopg

from utils import get_connection_info

log = logging.getLogger(__name__)


@click.command()
def main():
    with psycopg.connect(get_connection_info()) as conn:
        with conn.cursor() as cursor:
            # find all the tables that start with h3_grid*
            cursor.execute(
                """SELECT table_name
            FROM information_schema.tables as tables
            LEFT JOIN  h3_data on h3_data."h3tableName" = tables.table_name
            WHERE tables.table_name LIKE 'h3_grid%' and
            h3_data."h3tableName" is null;
            """
            )
            tables_to_drop = cursor.fetchall()
            if tables_to_drop:
                for table in tables_to_drop:
                    cursor.execute(f"DROP TABLE {table[0]}")
                log.info(
                    f"Tables {[table[0] for table in tables_to_drop]} don't have "
                    f"a corresponding entry in h3_data and were deleted"
                )
            else:
                log.info("No tables to delete")


if __name__ == "__main__":
    main()
