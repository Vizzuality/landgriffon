def required_percent_reduction(row):
    """Calculation of the required percentage of reduction.

    This reduction is calculated in all catchment which baseline water stress is above the threshold 0.4.
    More information can be found on the LandGriffon v2.0 methodology under the unsustainable water use indicator.
    NOTE: There are some cases where the basin is categorised as extremely high BWS (>80%) but the raw value is 9999.0
    We are considering in those cases that the bws raw value is equal to 0.8
    """
    if row["bws_cat"] > 2 and row["bws_raw"] != 9999:
        return ((row["bws_raw"] - 0.4) / row["bws_raw"]) * 100
    elif row["bws_cat"] == 4 and row["bws_raw"] == 9999:
        return ((0.8 - 0.4) / 0.8) * 100
    else:
        return 0
