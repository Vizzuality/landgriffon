import json
import os

from data.indicator_coefficient_importer.indicator_coefficient_importer import load_indicator_config


def test_load_indicator_config(pytest=None):
    # Test case 1: Test with valid JSON data
    os.environ['INDICATOR_COEFFICIENT_CONFIG'] = json.dumps({"test": {"file": "path/file.csv", "indicator_code": "AA"}})
    expected_output = [{"name": "test", "file": "path/file.csv", "indicator_code": "AA"}]
    real_output = load_indicator_config()
    assert real_output == expected_output

    # Test case 2: Test with invalid JSON data
    os.environ['INDICATOR_COEFFICIENT_CONFIG'] = "invalid_json"
    try:
        load_indicator_config()
    except ValueError as e:
        assert str(e) == "Environment variable 'INDICATOR_COEFFICIENT_CONFIG' must be a valid JSON string."
    # Test case 3: Test with empty JSON data
    os.environ['INDICATOR_COEFFICIENT_CONFIG'] = ""
    try:
        load_indicator_config()
    except ValueError as e:
        assert str(e) == "Environment variable 'INDICATOR_COEFFICIENT_CONFIG' is missing or empty. Aborting."
