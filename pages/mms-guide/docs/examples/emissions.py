import datetime as dt
from zipfile import ZipFile
from io import BytesIO

import requests
import polars as pl
import polars.selectors as cs

# Static Data
# 
# First we get the emissions intensity data, `GENSETID` and `DUID` from the `GENUNITS` table.
# 
# Note that this is one row per `GENSETID`, not one row per `DUID`.
# Most power/energy data (e.g. `DISPATCHUNITSCADA`, `P5UNITSOLUTION`) is at the `DUID` level. 
# So if we want to multiply emissions per unit of energy by energy, we need to somehow aggregate emissions intensity to the `DUID` level. (I am not aware of `GENSETID` level power measurements in the public data.)

def read_csv_from_url(url) -> pl.DataFrame:
    # Since these files are small, I am just downloading from nemweb each time, 
    # instead of caching files locally.
    # Once you start downloading bigger data (e.g. power data), 
    # you should download the files first (if not already downloaded from the last run), 
    # and then read from disk.
    # The purpose of this example is to show the joins later on.
    # This part is not the focus.

    r = requests.get(url)
    r.raise_for_status()

    assert url.upper().endswith(".ZIP"), "Expected URL to zip"
    with ZipFile(BytesIO(r.content)) as zf:
        assert len(zf.namelist()) == 1, f"Expected 1 file inside the zip, got {len(zf.namelist())}"
        csv_name = zf.namelist()[0]
        assert csv_name.upper().endswith(".CSV"), f"File inside zip is not a CSV"
        with zf.open(csv_name) as csv_f:
            df = (
                pl.read_csv(
                    csv_f,
                    skip_rows=1, # skip the header
                    comment_prefix='C,"END OF REPORT",' # skip the footer
                )
                .select(~cs.by_index(range(4))) # drop metadata columns
            )
    
    return df

def read_table(table):
    # Quick approach to find the latest or second-latest data:
    # take current date, minus 2 months. That should contain what we need.
    today = dt.date.today()
    ago = today - dt.timedelta(days=30+31)
    url = (
        f"https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/"
        f"MMSDM/2025/MMSDM_{ago.year}_{ago.month:02d}/MMSDM_Historical_Data_SQLLoader/DATA/"
        f"PUBLIC_ARCHIVE%23{table}%23FILE01%23{ago.year}{ago.month:02d}010000.zip"
    )
    return read_csv_from_url(url)

emissions_per_genset = read_table("GENUNITS")

genset_to_duid = (
    read_table("DUALLOC")
        
    # deduplicate to get the latest record per GENSETID
    .sort("EFFECTIVEDATE", "LASTCHANGED", descending=True)
    .select("DUID", "GENSETID")
    .unique(["DUID", "GENSETID"])
)

# We could blindly take the mean across all `GENSETID`s for each `DUID`.
# Let's try to do one step better, and take a weighted mean based on capacity.
# 
# Which Capacity? "Max" or "Registered"? It is not clear.
# See https://wattclarity.com.au/articles/2022/09/analyticalchallenge-installedcapacity/
capacity_col = "REGISTEREDCAPACITY" # or "MAXCAPACITY"

emissions_per_duid = (
    emissions_per_genset
    .join(genset_to_duid, how="left", on="GENSETID")
    .group_by("DUID")
    .agg(
        # weighted mean
        ((pl.col("CO2E_EMISSIONS_FACTOR") * pl.col(capacity_col)).sum() / pl.col(capacity_col).sum()).alias("CO2E_EMISSIONS_FACTOR")
    )
    .sort("CO2E_EMISSIONS_FACTOR")
)

# Now we have columns DUID (generator) and CO2E_EMISSIONS_FACTOR (tonnes of CO2e per MWh)
