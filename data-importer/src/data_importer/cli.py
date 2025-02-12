import typer
from rich import print

cli = typer.Typer()


@cli.callback()
def main():
    """LandGriffon data importer"""
    pass


@cli.command()
def run():
    """Run the data import"""
    pass


@cli.command()
def show_config(json: bool = False):
    """Print the config"""
    from .config import Settings

    if json:
        print(Settings().model_dump_json(indent=2))
    else:
        print(Settings())
