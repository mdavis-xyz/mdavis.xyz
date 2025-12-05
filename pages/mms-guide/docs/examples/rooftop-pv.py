import datetime as dt

# requires collecting
def upsample(lf, time_col, group_col="REGIONID") -> pl.DataFrame:
    return (
        lf.sort(time_col, group_col)
        .collect()
        .upsample(
            time_column=time_col,
            every=dt.timedelta(minutes=5),
            group_by=group_col,
            maintain_order=True,
        )
        .fill_null(strategy="backward", limit=5)
    )


lf = (
    pl.scan_parquet(os.path.join(data_cache_dir, "*ROOFTOP_PV_ACTUAL*.parquet"))

    .pipe(lambda lf: parse_datetimes(lf, cols=["INTERVAL_END"])) # parse_datetimes defined earlier
    .filter(pl.col("INTERVENTION") == 0)
    .filter(pl.col("REGIONID").str.ends_with("1"))

    # deduplicate
    .sort(by=["TYPE", "QI", "LASTCHANGED"], descending=[False, True, True])
    .group_by(["REGIONID", "INTERVAL_DATETIME"])
    .first()
    .select(["REGIONID", "INTERVAL_DATETIME", "POWER"])
    .rename({"INTERVAL_DATETIME": "INTERVAL_END"})

    # interpolate rooftop solar from 30 minutes to 5
    .pipe(lambda lf: upsample(lf, time_col="INTERVAL_END"))
    .lazy()
)