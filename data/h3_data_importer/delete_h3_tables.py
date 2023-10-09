import click
import psycopg

from utils import get_connection_info


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
            # todo filter by the ones that are here and not int h3_data
            tables = cursor.fetchall()
            print(tables)


if __name__ == "__main__":
    main()
