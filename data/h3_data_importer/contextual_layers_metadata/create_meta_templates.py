import json
from typing import Annotated

import typer


def main(
    datasets: Annotated[list[str], typer.Argument(help="List of datasets to create metadata for")],
):
    # Iterate over each dataset
    for dataset in datasets:
        # Create a dictionary for the metadata
        metadata = {
            "name": dataset,
            "description": "Description of the dataset",  # Replace with actual description
            "legend": {
                "name": "Legend name",  # Replace with actual legend name
                "id": "Legend id",  # Replace with actual legend id
                "unit": "Legend unit",  # Replace with actual legend unit
                "min": "Legend min",  # Replace with actual legend min
                "type": "range",  # Replace with actual legend type
                "items": [],  # Replace with actual legend items
            },
            "aggType": "mean",  # Replace with actual aggregation type
            "source": "Source of the dataset",  # Replace with actual source
            "license": "License of the dataset",  # Replace with actual license
        }

        # Write the metadata to a JSON file
        with open(f"{dataset}_metadata.json", "w") as f:
            json.dump(metadata, f, indent=4)


if __name__ == "__main__":
    typer.run(main)
