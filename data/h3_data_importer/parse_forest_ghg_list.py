import sys
import json

if __name__ == "__main__":
    list_file = sys.argv[1]
    column = sys.argv[2]
    with open(list_file) as f:
        sources = json.load(f)
    for feature in sources["features"]:
        attrs = feature["attributes"]
        print(attrs["tile_id"], attrs[column])
