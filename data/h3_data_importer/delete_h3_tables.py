import logging

import click
import psycopg

from utils import get_connection_info

log = logging.getLogger("delete_h3_tables")
logging.basicConfig(level=logging.INFO)


@click.command()
@click.option("--drop-contextuals", is_flag=True)
@click.option("--dry-run", is_flag=True)
def main(drop_contextuals: bool, dry_run: bool):
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
                if not dry_run:
                    for table in tables_to_drop:
                        cursor.execute(f"DROP TABLE {table[0]}")
                log.info(f"Deleted tables {', '.join(table[0] for table in tables_to_drop)}")
            else:
                log.info("All tables are linked properly to h3_data. Nothing to delete.")
            if drop_contextuals:
                # Contextual layer entries with a tileUrl defined are rasters that don't have a h3 dataset related.
                # We can't know if they are used or not, so we don't delete them.
                cursor.execute(
                    """SELECT contextual_layer.id
                FROM contextual_layer
                LEFT JOIN h3_data ON contextual_layer.id = h3_data."contextualLayerId"
                WHERE h3_data."contextualLayerId" IS NULL AND contextual_layer."tilerUrl" IS NULL;
                """
                )
                contextuals_to_drop = cursor.fetchall()
                if contextuals_to_drop:
                    if dry_run:
                        print(contextuals_to_drop)
                        return
                    cursor.execute(
                        """DELETE FROM contextual_layer
                    WHERE id = ANY(%s);
                    """,
                        (list(ctx[0] for ctx in contextuals_to_drop),),
                    )
                    log.info(f"Deleted contextual layers {', '.join(str(ctx[0]) for ctx in contextuals_to_drop)}")
                else:
                    log.info("All contextual layers are linked properly to h3_data. Nothing to delete.")


if __name__ == "__main__":
    main()
