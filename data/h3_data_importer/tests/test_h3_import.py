import os
from pathlib import Path

import pytest
import psycopg
from dotenv import load_dotenv


from ..utils import get_connection_info


@pytest.fixture(scope="session", autouse=True)
def load_env():
    project_root = Path(__file__).resolve().parents[3]
    load_dotenv(project_root / ".env")


@pytest.fixture(autouse=True)
def test_env_variables():
    print(f"Using DB {os.getenv('API_POSTGRES_DATABASE')} on {os.getenv('API_POSTGRES_HOST')}")
    if os.getenv("API_POSTGRES_DATABASE") is None:
        pytest.fail("API_POSTGRES_DATABASE is not set -> .env not found")


@pytest.fixture()
def conn():
    conn = psycopg.connect(conninfo=get_connection_info())
    yield conn
    conn.close()


def test_db_connection(conn):
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
            result = cur.fetchone()
            assert result[0] == 1, "The query result is not 1"
    except Exception as e:
        pytest.fail(f"DB connection Error: {e}")


def test_indicator_coefficient_has_any_link_to_material(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
        select "materialId" from indicator_coefficient
        """
        )
        result = cur.fetchall()
        assert len(result) > 0, "The query result is empty"


def test_material_is_linked_in_indicator_coefficients(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
        select ic.id from indicator_coefficient ic
        join material on "materialId" = material.id
        where material."hsCodeId" = '0407'
        """
        )
        result = cur.fetchall()
        assert len(result) > 0, "The query result is empty"
