import logging

import psycopg
import typer
from rich.console import Console
from rich.logging import RichHandler
from rich.table import Table

from data_importer.config import settings
from data_importer.loaders.base_loader import Loader
from data_importer.schemas import Indicators
from data_importer.schemas import Materials

FORMAT = "%(name)s - %(message)s"
logging.basicConfig(level="INFO", format=FORMAT, datefmt="[%X]", handlers=[RichHandler()])
log = logging.getLogger()

cli = typer.Typer()


@cli.callback()
def main():
    """LandGriffon data importer"""
    pass


@cli.command()
def run():
    """Run the data import"""
    materials_loader = Loader(Materials, settings.materials_json)
    materials_loader.write_to_db("material")
    indicators_loader = Loader(Indicators, settings.indicators_json)
    indicators_loader.write_to_db("indicator")


@cli.command()
def show_config(json: bool = False):
    """Print the config"""
    console = Console()
    if json:
        print(settings.model_dump_json(indent=2))
    else:
        table = Table(show_header=False, box=None)
        table.add_column("Setting", style="yellow")
        table.add_column("Value", style="green")
        for field, value in settings.model_dump().items():
            table.add_row(field, str(value))
        console.print(table)


@cli.command()
def check():
    log.info(f"Teeesssttt to {settings.database_uri.unicode_string()}")
    with psycopg.connect(settings.database_uri.unicode_string()) as conn:
        log.info(conn.execute("SELECT 1").fetchone())
