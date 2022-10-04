"""
Sample test for data

------
This sample demostrates using a pandas DataFrame object and
follows common pandas convertions

"""

import pytest
import pandas as pd
import datatest as dt


@pytest.fixture(scope='module')
@dt.working_directory(__file__)
def df():
    return pd.read_csv('example.csv')


def test_column_names(df):
    """
    Check that your data has the required columns
    """
    required_names = {'A', 'B', 'C'}
    dt.validate(df.columns, required_names)


def test_column(df):
    """
    Check that your dataframe has the columns in the order specified in a list
    """
    required_columns = ['A', 'B', 'C']
    dt.validate(df.columns, required_columns)


def test_a(df):
    """
    Check that a column has especific values
    """
    data = df['A'].values
    requirement = {'x', 'y', 'z'}
    dt.validate(data, requirement)


def test_max_value():
    """Validates values within a list"""
    data = [60, 200, 18, 99, 105]

    def max200(x):
        if x <= 200:
            return True
        return dt.Deviation(x - 200, 200)

    def test_sum():
        assert sum(data) == 482

    # ... add more functions here

    dt.validate(data, max200)


# validate data types


def test_float_types():
    data = [0.0, 1.0, 2.0]

    dt.validate(data, float)


# validate format - we can add json schema

# ...add more tests here...

if __name__ == '__main__':
    import sys
    sys.exit(pytest.main([__file__]))
