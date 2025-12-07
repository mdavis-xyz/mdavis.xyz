import polars as pl
import polars.selectors as cs

url = "https://www.nemweb.com.au/REPORTS/CURRENT/CDEII/CO2EII_AVAILABLE_GENERATORS.CSV"

lf = (
    pl.scan_csv(
        url,
        skip_rows=1, # skip the header
        comment_prefix='C,"END OF REPORT",' # skip the footer
    )
    .select(~cs.by_index(range(4))) # drop metadata columns
)

print(lf.collect())

df = lf.collect()

print(
    df
    .group_by("STATIONNAME")
    .agg(pl.col("DUID")
    .n_unique()
    .alias("unique_duid_count"))
    .sort("unique_duid_count")
)


print(
    df
    .group_by("DUID")
    .agg(pl.col("GENSETID")
    .n_unique()
    .alias("unique_genset_count"))
    .sort("unique_genset_count")
)


print(
    df
    .group_by("GENSETID")
    .agg(pl.col("DUID")
        .n_unique()
        .alias("unique_genset_duid_count")
    )
    .sort("unique_genset_duid_count")
)


print(
    df
    .group_by("GENSETID")
    .agg(pl.col("STATIONNAME")
        .n_unique()
        .alias("unique_genset_station_count")
    )
    .sort("unique_genset_station_count")
)
