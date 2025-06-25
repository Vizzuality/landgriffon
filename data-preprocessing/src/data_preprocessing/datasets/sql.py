import csv
from functools import partial
from io import StringIO

import kedro_datasets.pandas
import pandas as pd
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import insert


def insert_on_conflict_nothing(table, conn, keys, data_iter, index_elements=None):
    temp_table_name = f"{table.name}_temp"

    conn.execute(
        text("CREATE TEMP TABLE :temp_table_name (LIKE :table_name INCLUDING ALL) ON COMMIT DROP"),
        {"temp_table_name": text(temp_table_name), "table_name": text(table.name)},
    )

    # Convert data_iter to CSV in-memory
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerows(data_iter)
    buffer.seek(0)

    # Use raw connection for COPY
    dbapi_conn = conn.connection
    with dbapi_conn.cursor() as cur:
        cur.copy_expert(
            f"COPY {temp_table_name} ({', '.join(keys)}) FROM STDIN WITH CSV",
            buffer,
        )

    # Now insert from temp into target table with ON CONFLICT DO NOTHING
    insert_stmt = insert(table).from_select(
        keys, text(f"SELECT {', '.join(keys)} FROM {temp_table_name}")
    )
    insert_stmt = insert_stmt.on_conflict_do_nothing(index_elements=index_elements)

    result = conn.execute(insert_stmt)
    return result.rowcount


class SQLTableDataset(kedro_datasets.pandas.SQLTableDataset):
    """SQL table dataset but uses custom saving function to use COPY"""

    def save(self, data: pd.DataFrame) -> None:
        self._save_args["method"] = partial(
            insert_on_conflict_nothing,
            index_elements=self._save_args.pop("on_conflict_index", None),
        )
        self._save_args["if_exists"] = "append"
        data.to_sql(con=self.engine, **self._save_args)
