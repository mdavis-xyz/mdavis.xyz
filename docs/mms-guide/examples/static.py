# Grouping Generators by Fuel Type
# 
# This script is an example from my article about AEMO's MMS data:
# 
# https://www.mdavis.xyz/mms-guide
# 
# Here we download the list of generators. Unlike all other AEMO data, this one is on their aemo.com.au domain, not Nemweb, and it's an excel file, not CSV. 
# 
# This list contains a lot of very nuanced and varied fuel type descriptions, as well as several typos. So it is a bit fiddly to coerce this into something nice like solar/wind/hydro/coal/gas/battery. The purpose of this example is to show you how.

import os

from nemosis import static_table
import polars as pl
import requests

# Point to a folder on your machine
nemosis_data_cache = "/home/matthew/Data/nemosis/"

# Download The Data

# This normally works
# But AEMO's recent firewall change broke it
# https://github.com/UNSW-CEEM/NEMOSIS/issues/60
def get_with_nemosis():
    os.makedirs(nemosis_data_cache, exist_ok=True)
    df_pd = static_table("Generators and Scheduled Loads", nemosis_data_cache)
    # from Pandas to Polars
    df_pl = pl.from_pandas(df_pd)
    return df_pl
    
# A fallback, which is a bit more fiddly
def get_manually():
    url = "https://www.aemo.com.au/-/media/files/electricity/nem/participant_information/nem-registration-and-exemption-list.xlsx"

    # AEMO recently started discriminating based on User-Agent, blocking us
    # AEMO, if you are reading this and do not like it, then please
    # just serve this file through your existing channels for automated downloads.
    # i.e. the MMS Participant Data Replicator channels (nemweb and FTP)
    headers = {
        'Referer': 'https://www.aemo.com.au/energy-systems/electricity/national-electricity-market-nem/participate-in-the-market/registration',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    return pl.read_excel(response.content, sheet_name="PU and Scheduled Loads")

try:
    df = get_with_nemosis()
except ValueError as e: 
    if str(e) == "Excel file format cannot be determined, you must specify an engine manually.":
        print(f"Nemosis failed, switching to fallback method")
        df = get_manually()
    else:
        raise

df.head()

# Simplify Fuel Categories

static: pl.LazyFrame = (
    df
    # simplify fuel categories
    .with_columns(
        pl.concat_str(
            [
                "Fuel Source - Primary",
                "Technology Type - Descriptor",
                "Fuel Source - Descriptor",
            ],
            separator=" - ",
        )
        .str.to_lowercase()
        .alias("Fuel Detail"),
    )
    .filter(~pl.col("Participant").str.contains("Basslink"))
    .with_columns(
        pl.when((pl.col("DUID") == "-") & (pl.col("Station Name").str.contains("Jindabyne Pump At Guthega")))
        .then(pl.lit("hydro")) # exception for this one
        .when(pl.col("Fuel Detail").str.contains("battery"))
        .then(pl.lit("battery"))
        .when(
            pl.col("Fuel Detail").str.contains("hydro")
            & (pl.col("Dispatch Type") == "Load")
        )
        .then(pl.lit("pumps"))
        .when(pl.col("Fuel Detail").str.contains("hydro"))
        .then(pl.lit("hydro"))
        .when(pl.col("Fuel Detail").str.contains("solar"))
        .then(pl.lit("solar_gridscale"))
        .when(pl.col("Fuel Detail").str.contains("wind"))
        .then(pl.lit("wind"))
        .when(pl.col("Fuel Detail").str.contains("waste coal mine gas"))
        .then(pl.lit("coal"))
        .when(
            pl.any_horizontal(
                (
                    pl.col("Fuel Detail").str.contains(s)
                    for s in [
                        "natural gas",
                        "ocgt",
                        "coal seam gas",
                        "coal seam methane",
                    ]
                )
            )
        )
        .then(pl.lit("gas"))
        .when(
            pl.any_horizontal(
                (pl.col("Fuel Detail").str.contains(c))
                # don't blindly search for the word "coal"
                # because coal seam gas should count as gas not coal
                for c in ["black coal", "brown coal"]
            )
        )
        .then(pl.lit("coal"))
        .when(pl.col("Fuel Detail").str.contains("diesel"))
        .then(pl.lit("distillate"))
        .when(pl.col("Fuel Detail").str.contains("biomass"))
        .then(pl.lit("biomass"))
        .when(pl.col("DUID").str.contains("PUMP") & (pl.col("Dispatch Type") == "Load"))
        .then(pl.lit("pumps"))
        .alias("FUEL_TYPE")
    )
    .select("DUID", pl.col("Region").alias("REGIONID"), "FUEL_TYPE")
)

# check we've categorised everything
uncategorised = static.filter(pl.col("FUEL_TYPE").is_null())
if not uncategorised.is_empty():
    display(uncategorised)

assert uncategorised.height == 0, "Some generators were not categorised"


# Conclusion
# 
# Now we have a dataframe (`static`) which has columns:
# 
# - `DUID`: generator identifier
# - `REGIONID`: where is it
# - `FUEL_TYPE`: wind, battery, distillate, hydro, biomass, pumps, coal, solar_gridscale, gas
# 
# Note that rooftop solar is not included here.
