"""
Script to convert old material.csv and indicators.csv to json

"""

import argparse
import csv
import json


def main(input_csv: str, output_json: str):
    data = []
    with open(input_csv, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("metadata"):
                try:
                    row["metadata"] = json.loads(row["metadata"])
                except json.JSONDecodeError:
                    print(f"Warning: Could not parse metadata for row {row['id']}")
                    row["metadata"] = None
            else:
                row["metadata"] = None

            data.append(row)
    with open(output_json, mode="w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"CSV converted to JSON and saved as {output_json}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("output")
    args = parser.parse_args()
    main(args.input, args.output)
