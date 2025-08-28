import pandas as pd


def to_table(data: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame.from_records(data)
    df = df.drop("metadata", axis=1)
    return df
