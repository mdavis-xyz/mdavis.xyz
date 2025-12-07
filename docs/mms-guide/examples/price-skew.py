# Find how skewed Australia's wholesale electricity prices are.
# Find x for:
# "Half of all generators' energy revenue each year comes 
#  from only x% of trading intervals."
#
# This script is an example from my article about AEMO's MMS data:
# 
# https://www.mdavis.xyz/mms-guide

from nemosis import cache_compiler
import polars as pl
import os

start_time = '2024/01/01 00:00:00'
end_time = '2024/12/31 23:55:00'
data_directory = '/home/matthew/Data/nemosis/'
#data_directory = '/media/matthew/nemweb/nemosis'
results_directory = os.path.join(os.path.dirname(data_directory), 'results')
result_path = os.path.join(results_directory, "results.parquet")

for d in [data_directory, results_directory]:
    os.makedirs(d, exist_ok=True)

hrs_per_interval = 5 / 60 # 5 minute intervals
frac_threshold = 0.5

dt_fmt = "%Y/%m/%d %H:%M:%S"

# reduce memory usage
os.environ['POLARS_MAX_THREADS'] = str(max(1,os.cpu_count() // 2))

for table in ["DISPATCHPRICE", "DISPATCH_UNIT_SCADA", "DUDETAILSUMMARY"]:
    cache_compiler(start_time, end_time, table, data_directory, fformat='parquet')

# query the data with Polars
prices = (
    pl.scan_parquet(os.path.join(data_directory, "*DISPATCHPRICE*.parquet"))
    .filter(pl.col("INTERVENTION") == 0)
    .rename({"RRP": "PRICE"})
    .with_columns(
        pl.col("SETTLEMENTDATE").str.strptime(pl.Datetime(time_unit="ms"), format=dt_fmt)
    )
)

# calculate average energy per generator from instantaneous power
energy = (
    pl.scan_parquet(os.path.join(data_directory, "*DISPATCH_UNIT_SCADA*.parquet"))
    .rename({"SCADAVALUE": "POWER_START"})
    # Find the next POWER_START per DUID, and call that POWER_END
    .sort("DUID", "SETTLEMENTDATE")
    .with_columns(
        pl.col("POWER_START").shift(-1).over("DUID").alias("POWER_END")
    )
    .with_columns(
        ((pl.col("POWER_START") + pl.col("POWER_END")) / 2).alias("POWER_AVG")
    )
    .with_columns(
        (pl.col("POWER_AVG") * hrs_per_interval).alias("ENERGY_MWH")
    )
    .with_columns(
        pl.col("SETTLEMENTDATE").str.strptime(pl.Datetime(time_unit="ms"), format=dt_fmt)
    )
)


generator_static = (
    pl.scan_parquet(os.path.join(data_directory, "*DUDETAILSUMMARY*.parquet"))

    # filter out LOAD and BIDIRECTIONAL
    # this might include some batteries and pumped hydro actually
    .filter(pl.col("DISPATCHTYPE") == "GENERATOR")

    # deduplicate (this is standing data which may be repeated each month,
    # and other columns change over time anyway)
    .sort("START_DATE", "LASTCHANGED")
    .select("DUID", "REGIONID")
)

# join energy with generator data to get region
# then join with prices

(
    energy
    .join(generator_static, how="left", on="DUID")
    .join(prices, how="left", on=["REGIONID", "SETTLEMENTDATE"])
    .with_columns(
        (pl.col("PRICE") * pl.col("ENERGY_MWH")).alias("REVENUE")
    )
    # aggregate to all generators within a region
    .group_by("REGIONID", "SETTLEMENTDATE")
    .agg(pl.col("REVENUE").sum())
    # find the most profitable intervals
    .sort("REGIONID", "REVENUE", descending = True)
    # find the cumulative fraction of revenue over the time period
    .with_columns(
        (pl.col("REVENUE").cum_sum().over("REGIONID") / pl.col("REVENUE").sum().over("REGIONID")).alias("FRAC_REVENUE"),
        (pl.int_range(1, pl.len() + 1).over("REGIONID") / pl.len().over("REGIONID")).alias("FRAC_TIME")
    )
    # find the last row just before 50%
    .filter(pl.col("FRAC_REVENUE") <= frac_threshold)
    .group_by("REGIONID")
    .last()
    .select("REGIONID", "FRAC_TIME")
    .sort("FRAC_TIME")
    # stream to parquet and then read back
    # because just calling .collect() uses lots of memory (Polars issue)
    .sink_parquet(result_path)
)

print(pl.read_parquet(result_path))
