import os
import shutil
import psycopg2
from data.base_data_importer.csv_to_table import main

conn = psycopg2.connect(
    host=os.getenv('API_POSTGRES_HOST'),
    port=os.getenv('API_POSTGRES_PORT'),
    database=os.getenv('API_POSTGRES_DATABASE'),
    user=os.getenv('API_POSTGRES_USERNAME'),
    password=os.getenv('API_POSTGRES_PASSWORD')
)


def mock_download_base_data(files_to_download):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    source_dir = os.path.join(current_dir, '../base_data_importer/data')
    dest_dir = os.path.join(current_dir, '../base_data_importer')
    os.makedirs(dest_dir, exist_ok=True)
    downloaded_files = []
    for file_name in files_to_download:
        source_path = os.path.join(source_dir, file_name)
        dest_path = os.path.join(dest_dir, file_name)
        shutil.copyfile(source_path, dest_path)
        downloaded_files.append(file_name)
    return downloaded_files


def test_import_base_data(mocker):
    mocker.patch(
        "data.base_data_importer.csv_to_table.download_base_data",
        side_effect=mock_download_base_data
    )
    main()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM units")
                count_units = cur.fetchone()[0]
                assert count_units > 0, "Units has no data."

                cur.execute("SELECT COUNT(*) FROM indicator")
                count_indicator = cur.fetchone()[0]
                assert count_indicator > 0, "Indicator has no data"

                cur.execute("SELECT COUNT(*) FROM material")
                count_indicator = cur.fetchone()[0]
                assert count_indicator > 0, "Material has no data"

                cur.execute("SELECT COUNT(*) FROM unit_conversion")
                count_indicator = cur.fetchone()[0]
                assert count_indicator > 0, "Unit conversion has no data"


    finally:
        conn.close()
