import logging

import click
import psycopg

from utils import get_connection_info

log = logging.getLogger("delete_h3_tables")
logging.basicConfig(level=logging.INFO)


@click.command()
@click.option("--dry-run", is_flag=True)
def main(dry_run: bool):
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
                    if not dry_run:
                        cursor.execute(f"DROP TABLE {table[0]}")
                log.info(f"Tables {', '.join(table[0] for table in tables_to_drop)} were deleted")
                cursor.execute(
                    """
                SELECT "contextualLayerId" FROM h3_data
                WHERE "h3tableName" in (%s)
                """,
                    (tables_to_drop,),
                )
                tables_deleted_with_contextuals = cursor.fetchall()
                print(tables_deleted_with_contextuals)
            else:
                log.info("No tables to delete")


if __name__ == "__main__":
    main()
