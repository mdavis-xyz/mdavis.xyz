This guide is for researchers who want to analyse Australia's electricity industry. 
Fortunately there is far more public data available for this space than almost any other industry, or even any other country's electricity market. 
Unfortunately there are many undocumented aspects of the data which can trip up newcomers. 
The purpose of this post is to highlight some of those 'gotcha's.

The focus here is on how to dive deep into the data for hours to perform bespoke analysis, mostly for queries which require data on a timescale smaller than 1 day.
Before you spend the time on this, first check whether you can quickly obtain the data you want from [Open Electricity](https://explore.openelectricity.org.au/energy/nem/?range=7d&interval=30m&view=discrete-time&group=Detailed). Other high-level statistics are available from the [AEMO Data Dashboard](https://www.aemo.com.au/energy-systems/data-dashboards) and the [IEA](https://www.iea.org/countries/australia).

## Quickstart

- The list of all tables and their contents is [here](https://nemweb.com.au/Reports/Current/MMSDataModelReport/Electricity/Electricity%20Data%20Model%20Report.htm).
- First try to download and extract the data with [Nemosis](https://github.com/UNSW-CEEM/NEMOSIS) if you can. Otherwise write your own code to do so, as described below.
- Once you have queryable data, jump to [How to query and understand the data](#How to query and understand the data) and [Understanding the Market Structure](#Understanding the Market Structure).

## What data is available?

Australia's National Electricity Market (NEM) includes Queensland, New South Wales, the ACT, Victoria, and South Australia. The market is operated by the Austrlaian Energy Market Operator (AEMO). (Typically "AEMO" is used in sentences without a preceding "the".)
The NEM does not include Western Australia or the Northern Territory. Those are separate grids, with separate data. The Western Australia Market (WEM) is also operated by AEMO, but the market rules, data schemas and data pipelines are different. This post is focused on Australia's NEM, and the data in the "Market Management System" (MMS) dataset.

The publicly available MMS data is very comprehensive.
If you have experience with data from other electricity markets/grids, you will be pleasantly surprised by how much data there is.
The data includes:

- Prices (every 5 minutes)
- Price forecasts (every 5 minutes, for the next few 5 minute intervals, and less granular forecasts up to 2 days in advance)
- Total energy generated/consumed, every 5 minutes
- Energy generated, per generator, per 5 minutes
- Detailed fuel type of each generator (so you can calculate energy, revenue, capture price etc grouped by fuel type)
- Transmission flows between regions
- Emissions intensity of generators
- Raw bids and rebids of each generator, including a category and sentence justifying each bid
- Contraints: AEMO does not just intersect supply and demand curves. Australia's grid is far more constrainted than most, so AEMO's optimiser, the "NEM Dispatch Engine" (NEMDE) incorporates hundreds of constraints for system strength, transmission line capacity etc.
- Ancillary services: These are defined below. The data includes bids, and how much capacity is made available each period, per generator and in aggregate. Finding out how much was _used_ is difficult, but possible.

You can estimate the energy revenue of each generator. The exact invoice amount each participant is paid is not public. (Generators are paid for their energy, but pay a wide range of fees, e.g. for wind/solar forecast inacuracies.) You can estimate this amount to within a few percent. However doing so requires a great deal of expertise, which is beyond the scope of this post.

The MMS dataset does not include information about green products such as Australia carbon credit units (ACCUs). For that data you will need to search elsewhere.
There are other datasets which provide a per-generator per-day emissions breakdown.
TODO: Find source.

This dataset also does not include any information about the _cost_ incurred by each generator, only their output and revenue.
For estimates of costs, you can look at the CSIRO GenCost model, or AEMO's System Plan.

Most data is published publically every 5 minutes. Some sets of data are published with a deliberate delay of a few days (e.g. bids).
The online dataset goes back to 2009, although some tables within that do not go back as far. 


### The Tables

AEMO's dataset contains many different 'tables'. They are called this because AEMO expects market participants to load the data into tables in a SQL database. 
(If you are an analyst querying CSV/parquet files with Pandas, these may each be a different dataframe. The concept is the same.)
There are hundreds of tables available to market participants. Some of those are not available to the public (e.g. settlement data), but most are.
The most important ones are:

- `DISPATCHPRICE` - for energy and ancillary prices
- `P5MIN_REGIONSOLUTION`
- `DISPATCH_UNIT_SCADA` - per-generator power output
- `DISPATCHLOAD` - despite the name, this is for both generators and loads. This is per-generator power (both actual, and what they were supposed to do), ancillary service dispatch (what they were supposed to be able to provide if called upon, but not whether they were actually called upon)
- `DISPATCHREGIONSUM` - This contains region-level power, both actual and planned. This is for both generated, consumed and imported/exported power, as well as ancillary services. A few of the columns about total renewable output/capacity are always empty, unfortunately.
- `BIDDAYOFFER`, `BIDOFFERPERIOD`, `BIDPEROFFER_D`, `BIDDAYOFFER_D`: Raw bids by generators. These are very large, up to 2 TB uncompressed if you download 10 years of data. They are also very complex to understand. A dedicated section explains them further down.
- There is [**4 second** granularity power data](https://github.com/UNSW-CEEM/NEMOSIS/wiki/AEMO-Tables#four-second-fcas-data-fcas_4_second) for every generator, as well as some other data (such as grid frequency). This is exceptionally large, and in a different location and format to the other data. This is described further down.
- `DUDETAILSUMMARY` contains some static data about each generator

## Understanding the Market Structure

No forward market

Rebids vs bids

Negative prices

Price spikes

what is FCAS?

How are batteries classified?

Demand response

scheduled vs non-scheduled

### Constraints

## Where is the documentation?

The official documentation for the meaning of each table, each column and their data type is [here](https://nemweb.com.au/Reports/Current/MMSDataModelReport/Electricity/Electricity%20Data%20Model%20Report.htm). The datatypes are Oracle SQL data types.

Sometimes the explanations in this documentation are useful. For example, the definition of `UIGF` in `DISPATCHREGIONSUM` is

> Regional aggregated Unconstrained Intermittent Generation Forecast of Semi-scheduled generation (MW).

(Unconstrained means that AEMO is not telling wind and solar generators to turn down and 'spill' wind/sunshine.
Semi-scheduled is what most wind and solar are. AEMO tells them what to generate, but it's only an upper limit. In contrast coal and gas are scheduled. They cannot generate less or more power than they are told.)

Some documentation is not useful. For example:

TODO: give example of bad documentation

When you find that documentation lacking, you can also check the [Nemosis Wiki](https://github.com/UNSW-CEEM/NEMOSIS/wiki/Column-Summary) and [Watt Clarity](https://wattclarity.com.au/).

For specific terms such as "bidirectional unit", "wholesale demand response" etc, you may need to search elsewhere on [AEMO's website](www.aemo.com.au/) to find answers. Note that AEMO sometimes restructure their website in a way which breaks bookmarks and search engine results. Aside from that, their website often has very high-level information aimed at the general public, and some extremely niche detail, without much of a middle ground for researchers who want to understand concepts without trading in the market.

There is no machine-readable schema available (e.g. a json file containing all column names and types). I had written a crawler to scrape the metadata, but then AEMO changed the structure of this documentation page in a way that broke my crawler, and made it harder for humans to browse (by mixing tables on the same iframe so ctrl-f may find columns for the wrong table). If you are interested in a machine-readable schema, let me know.
AEMO do publish SQL scripts (privately, for market participants only) which create empty tables with the right schema in Oracle or Microsoft SQL Server. You could parse those scripts to get the schema. (I have done that in the past.) Those scripts have subtle inconsistencies which make me suspect that they are hand written. If so, it seems possible that even internally, AEMO does not have a single machine-readable schema as their source of truth.
TODO: find the scripts.

## Where is the data?

Most of the data is in the "MMSDM", on a public website called "nemweb".
The root url is https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/ .
You can explore those folders to get a sense of the structure.
The files you want are probably the ones like:

https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/2025/MMSDM_2025_09/MMSDM_Historical_Data_SQLLoader/DATA/PUBLIC_*.zip

(Note the month and years in the URL).
The filename mostly (but not always) corresponds to the table.
e.g. [PUBLIC_ARCHIVE#DISPATCHPRICE#FILE01#202509010000.zip](https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/2025/MMSDM_2025_09/MMSDM_Historical_Data_SQLLoader/DATA/PUBLIC_ARCHIVE%23DISPATCHPRICE%23FILE01%23202509010000.zip) contains data for the `DISPATCHPRICE` table.
The large tables may be split into multiple files per month.

The other folders contain scripts and the same data in other forms used to load the data into an Oracle SQL database. 
This is what AEMO expects market participants to do. However it's incredibly complex and error-prone. For example some scripts make assumptions about column order, but the data files do not necessarily have a consistent column order across months. The schema itself has changed over the years, and the historical scripts do not necessarily cope with that well. From personal experience, my advice is to not touch that stuff unless you already have extensive experience with PDR Loader and already have an Oracle SQL database.

The [NEMDE](https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/NEMDE/) folder contains the detailed inner workings of the linear optimiser used by AEMO to decide how much each generator should produce. This is useful if you want to query "price setter" data to understand who set the price. Note that you should be cautious when drawing conclusions from that data. See the guide from [Watt Clarity](https://wattclarity.com.au/articles/2019/02/a-preliminary-intermediate-guide-to-how-prices-are-set-in-the-nem/).

The live (5 minutes old) data is available in [/Reports/CURRENT](https://www.nemweb.com.au/REPORTS/CURRENT/). The file formats are more complicated because they're several CSV files with different columns concatenated into one file. You probably do not need that unless you are actively operating in the market. 

## How to download the data?

### Data Size

The biggest two tables add up to as the rest combined. So only download what you need.

For the full decade or more of historical data, most of the tables are hundreds of megabytes (as compressed CSVs).
Price forecasts are tens of gigabytes.
Bidding data is hundreds of gigabytes.
Price setter data is also hundreds of gigabytes.

### Nemosis

There are a few open source tools out there for downloading and parsing AEMO's data.
Nick Gorman from UNSW has written a great library called [Nemosis](https://github.com/UNSW-CEEM/NEMOSIS).

Here is an example of how to obtain the `DISPATCHPRICE` data as a Pandas dataframe:
 
```
from nemosis import dynamic_data_compiler

start_time = '2017/01/01 00:00:00'
end_time = '2017/01/01 00:05:00'
table = 'DISPATCHPRICE'
raw_data_cache = 'C:/Users/your_data_storage'

price_data = dynamic_data_compiler(start_time, end_time, table, raw_data_cache)
```

Personally I prefer [Polars](https://pola.rs/) to Pandas.
If you haven't heard of Polars, it is like the new Pandas.
It is about 30 times faster, and I find the syntax easier to read and write.
(No more dreaded errors about "A value is trying to be set on a copy of a slice from a DataFrame.", or clunky `df[df[col]]`, `df.loc['col', df['col'] == df['col']]`.)
For this, you can use the `cache_compiler` to just save the data as Parquet with Nemosis, then query those files on disk with Polars.
For example:

```
from nemosis import cache_compiler
import polars as pl
import os

start_time = '2024/01/01 00:00:00'
end_time = '2024/01/01 00:05:00'
table = 'DISPATCHPRICE'
raw_data_cache = '/home/matthew/Data/nemosis'

# download zips of CSV files 
# extract them, conver them to parquet with nemosis
cache_compiler(start_time, end_time, table, raw_data_cache, fformat='parquet')

def parse_datetimes(
    lf, cols=["SETTLEMENTDATE"], format="%Y/%m/%d %H:%M:%S"
) -> pl.LazyFrame:
    for col in cols:
        lf = lf.with_columns(
            pl.col(col).str.strptime(pl.Datetime(time_unit="ms"), format=format)
        )
    return lf


# query the data with Polars
lf = (
    pl.scan_parquet(os.path.join(raw_data_cache, "*DISPATCHPRICE*.parquet"))
    .pipe(parse_datetimes)
)

print(lf.collect())
```

Note that I am passing a wildcard filename `*DISPATCHPRICE*.parquet` to polars.
This is because Nemosis downloads all files into the same directory.
If you are processing multiple files (e.g. `P5MIN_REGIONSOLUTION` and `DISPATCHPRICE`) you need this string to tell Polars which files to read and which to ignore.
Also, Nemosis currently saves datetimes to disk as strings. If using `cache_compiler`, you need to parse them into datetimes yourself. Since this happens for every table, I factored that into a simple function with `.pipe(parse_datetimes)`.

Sometimes Nemosis excludes columns from the data. (It includes only the most important columns, as an optimisation.)
If this happens (e.g. 1 second FCAS data), you can fix that with [this workaround](https://github.com/UNSW-CEEM/NEMOSIS/blob/master/README.md#accessing-additional-table-columns).

Nemosis has some limitations.
I am working with the maintainer to make [some improvements](https://github.com/UNSW-CEEM/NEMOSIS/issues?q=author%3Amdavis-xyz).
In particular, it loads each file into memory as a Pandas dataframe (even when using `cache_compiler`). This means that you cannot process the large files (mostly just bid data) on a normal laptop. 

If Nemosis works for you, skip the next sections and jump to [How to query and understand the data](#How to query and understand the data).
If not, the next few sections describe the details of how to download and parse AEMO's data files.

### PDR Batcher and PDR Loader

AEMO created this dataset and the Data Interchange for market participants (generators, retailers etc). This was designed in the 90s, prior to the popularity of REST APIs, TLS, parquet files, distributed systems, clouds etc. They expect that anyone who wants to read the data will download a pair of applications called "PDR Batcher" and "PDR Loader". ("PDR" stands for Participant Data Replicator.) Batcher downloads the files over FTP, inside a private VPN, then Loader loads them one row at a time into an Oracle SQL Database. The documentation is [here](https://di-help.docs.public.aemo.com.au/Content/Index.htm?tocpath=_____1).

There are several challenges with this approach.
The first is that AEMO removed this application from their website.
They took it down when the [log4j vulnerability](https://en.wikipedia.org/wiki/Log4Shell) become public, because this software was affected. Then when they released a patched version months later, they did so through the private VPN, only to participants.

Even if you have a copy, it's extremely difficult to get working unless you know someone with experience. If you're a researcher, you do not have the time to spend weeks learning how this bespoke system works, and debugging it when it does not.  The system is designed as a thick client, instead of a clear abstract API. There are many obscure mapping tables an configuration options. (e.g. How do you tell PDR Batcher which tables should be append-only, and which ones should overwrite existing rows based on certain partition columns?) The latest release did add a lot of great functionality (e.g. natively connecting to cloud storage such as S3), but my view is that if you're just a researcher (and even for some market participants) it is not worth using. e.g. I know people who tried to backfill a fresh database with all publically available data. They ran into many issues. They asked AEMO for help, and were told that there is no simple, generalised way to backfill all the data.

PDR Loader operates one row at a time. If you want to backfill all bid or price prediction data for the last decade, that takes weeks, even if you use large, expensive servers. This was probably because the system is optimised for operational use cases, where generators insert a few rows at a time into a row-based database, and query mostly the last few rows in each table. However if you are a researcher doing analytic queries about historical data, you will probably do infrequent, batched insertions, and your queries will scan most of the rows in a table. So a column-based approach (e.g. parquet files) is probably [more suitable](https://r4ds.hadley.nz/arrow#advantages-of-parquet). Running a Oracle or Microsoft SQL Server database with 1 TB of data in the cloud is expensive. On prem options have their challenges too. (e.g. will your laptop have enough memory even if you run a SQL server locally, connected to a slow external hard drive?) Using a more modern, column-based approach (e.g. parquet files locally or even in the cloud) will be far cheaper.

The main benefit of PDR Loader over a DIY approach is that it will figure out which tables are append-only, and which are update-insert.
(Or rather, you need to somehow find the configuration file that tells PDR Loader how to do this.)
That is, AEMO publishes new data all the time. Sometimes the new rows should be added above/below the old rows. 
Sometimes the old rows should be updated.
It depends on the table. (Remember, there are hundreds of tables.)
If you use a DIY approach (including Nemosis), you may need to deduplicate the data when you query it. 
This is described later in [Deduplication](#Deduplication).

### Connectivity

As mentioned earlier, AEMO expects market participants to download these files and private files over a FTP inside a private VPN.
I think the public website is intended for researchers, which is fantastic. Although I have never seen AEMO state this goal, or enumerate conditions of use. Please do not hammer their website (e.g. downloading data you do not need, or doing an unreasonable number of parallel downloads). I live in fear that one day they will simply turn off nemweb.

Nemweb is hosted in AWS's Sydney (`ap-southeast-2`) region. So if you are connecting from the cloud, choose something in Sydney. (For example, I am living in France at the moment. Downloading the data to my laptop is slow. If I spin up a server in Sydney the download is far faster, and then I connect to that server with Jupyter over SSH.)

Nemweb has both a http and https interface. Note that if you are crawling the HTML file pages, sometimes the encrypted HTTPS pages contain links to unencrypted HTTP pages. I think they have fixed this now. However I am mentioning it because if you are doing this in a network environment where outbound HTTP (port 80) is blocked and HTTPS (port 443) is allowed, then you will get unexpected timeouts which cannot be resolved through retries.

Nemweb's servers can be slow and unreliable. Try to add sleeps between requests, and have aggressive [retries with delays and backoff](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/).


### Reusing the HTTP Connection

Like for most webscraping and APIs, you should reuse the HTTP connection. This speeds up the download and reduces AEMO's server load (so they're less likely to take down the data one day).

For example, if you are downloading all the price data with Requests in Python:

```
import requests

data = []
for year in range(2024, 2026):
    for month in range(12):
        url = f"https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/{year}/MMSDM_{year}_{month}/MMSDM_Historical_Data_SQLLoader/DATA/PUBLIC_ARCHIVE%23DISPATCHPRICE%23FILE01%23{year}{month}010000.zip"
        resp = requests.get(url)
        resp.raise_for_status()
        data.append(resp.json())
```

There's a small trick you can use to improve this: [`requests.Session`](https://docs.python-requests.org/en/latest/user/advanced/#session-objects)!
This looks like:

<!-- Use CSS to highlight changes -->
<pre><code>import requests

<span class="added">session = requests.Session()</span>
data = []
for year in range(2024, 2026):
    for month in range(12):
        url = f"https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/{year}/MMSDM_{year}_{month}/MMSDM_Historical_Data_SQLLoader/DATA/PUBLIC_ARCHIVE%23DISPATCHPRICE%23FILE01%23{year}{month}010000.zip"
        resp = <span class="changed">session</span>.get(url)
        resp.raise_for_status()
        data.append(resp.json())
</code></pre>

I explained this in more detail [here](../requests-session).

### File Formats

###= Quick File Formation Explanation For Monthly MMSDM Data

For the [monthly MMSDM data](https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/2025/MMSDM_2025_09/MMSDM_Historical_Data_SQLLoader/DATA/) that this post focuses on, the files are zips of CSVs, with one CSV per zip file.

A file might look like:

```
C,SETP.WORLD,DVD_DISPATCHPRICE,AEMO,PUBLIC,2025/10/08,09:02:27,001759878147550,MONTHLY_ARCHIVE,001759878147550
I,DISPATCH,PRICE,5,SETTLEMENTDATE,RRP
D,DISPATCH,PRICE,5,"2025/09/01 00:05:00",1.1
D,DISPATCH,PRICE,5,"2025/09/01 00:10:00",2.2
C,"END OF REPORT",4
```

The content you care about is really:

```
SETTLEMENTDATE,RRP
"2025/09/01 00:05:00",1.1
"2025/09/01 00:10:00",2.2
```

The CSVs have a header and a footer. (These have a different number of columns to the main data, which some CSV parsing libraries do not like.)
Most CSV parsers can skip the header easily. You are unlikely to need that information. The timestamp in the header tells you the exact time when AEMO _generated_ the data, which might be useful for some niche queries.
Skipping the footer can be harder. Few libraries have a `skip_footer` option. With some libraries you may need to read the file as text first to count the rows, then tell it to only read the first N-1 rows. Alternatively you can tell it that the "comment" character is `C`, but only if that comment option only applies from the start of the line. I tend to parse these with Polars, in which case you can tell it that the comment _prefix_ is `C,"END OF REPORT",`.

After stripping the header and footer, you will also need to drop the first 4 columns. These are metadata columns. (e.g. in this example, `DISPATCH` and `PRICE` tell you that this data is for the `DISPATCHPRICE` table. However most such mappings are less obvious. You should figure out which file goes where from the filename if you can.) Note that there may be overlapping column names. Some tables have a name for the 2nd or 3rd column (which is metadata) which is the same as the name of another column later on (which is data).

###= File Format Details, And Other Data Files

For other AEMO data (e.g. the [daily data](https://www.nemweb.com.au/REPORTS/ARCHIVE/)) the files are zips of many zips of many CSVs. (I have never seen AEMO publish zips  of zips of zips. If you're programatically unzipping nested zips, watch out for [zip bombs](https://en.wikipedia.org/wiki/Zip_bomb).)

The daily files have a more complicated file structure. You should avoid parsing these unless you really want live data (within 5 minutes). In case you do, here is an example of such a file.

```
C,SETP.WORLD,DVD_DISPATCHPRICE,AEMO,PUBLIC,2025/10/08,09:02:27,001759878147550,MONTHLY_ARCHIVE,001759878147550
I,DISPATCH,PRICE,5,SETTLEMENTDATE,RRP
D,DISPATCH,PRICE,5,"2025/09/01 00:05:00",1.1
D,DISPATCH,PRICE,5,"2025/09/01 00:10:00",2.2
I,DISPATCH,REGIONSUM,3,REGIONID,SETTLEMENTDATE,TOTALDEMAND
D,DISPATCH,REGIONSUM,3,NSW1,"2025/09/01 00:10:00",5.6
D,DISPATCH,REGIONSUM,3,QLD1,"2025/09/01 00:10:00",7.8
D,DISPATCH,REGIONSUM,3,VIC1,"2025/09/01 00:10:00",9.0
C,"END OF REPORT",9
```

The interesting thing here is that the number of columns changes throughout the file, even after removing the header and footer.
This is because each CSV file is actually several CSV files concatenated together.
There are two chunks of data you want to extract:

`DISPATCHPRICE`:
```
SETTLEMENTDATE,RRP
"2025/09/01 00:05:00",1.1
"2025/09/01 00:10:00",2.2
```

and `DISPATCHREGIONSUM`:

```
REGIONID,SETTLEMENTDATE,TOTALDEMAND
NSW1,"2025/09/01 00:10:00",5.6
QLD1,"2025/09/01 00:10:00",7.8
VIC1,"2025/09/01 00:10:00",9.0
```

To process this, you must read line by line, and look at the first character, which will be `C`, `I` or `D`.

* `C` means this is a 'control' row. Typically just the header or footer, although I have seen multi-line headers in some obscure files. You should probably ignore all such lines.
* `I` means this is an 'information' row. These rows contain the column headers of a new table.
* `D` means this is a 'data' row. These rows contain the actual data.

Again it is worth pointing out that mapping `DISPATCH` and `REGIONSUM` to `DISPATCHREGIONSUM` sounds straightforward, but it is often not. Sometimes it would be something like `DISPATCH_REGIONSUM`, sometimes it is something completely different (especially for bids).

The 4th column is an integer. It is somehow related to the versioning of the schemas of each table. I do not understand it exactly, and have only seen one situation in all my years of working with this data where it mattered.

The final row is used as a checksum. The integer is the number of rows in the overall file (including the header and footer). I am unsure how rows with escaped newlines are counted. I normally just ignore this. The only time I have seen a checksum mismatch was with data in this format from someone other than AEMO, who calculated the checksum excluding the footer. This checksum was put in because this system was designed back in the 90s, when formats such as FTP could result in partial files being written to disk, and file processing commencing prior to the download finishing. With modern protocols such as HTTP over TCP, and especially with object storage such as AWS S3, getting only half a file is very unlikely. Even more so if you're splitting up your analysis script to first download all the files you want, then parse them, in the same process.

### File Names

Many files have a `#` in the name. Note that if you are using a terminal (e.g. Bash on Linux), this will be treated as a comment. So instead of `cat my#file.CSV` do `cat "my#file.CSV"`, otherwise you will get "File my not found".
AEMO uses uppercase for file extensions. (`.CSV` and `.ZIP`, not `.csv`, `.zip`.)

## How to preprocess the data?

### Parsing Timestamps

Most timestamps are in the format `%Y/%m/%D %H:%M:%S`, e.g. "2025/11/10 19:30:00"`.
AEMO data never contains just a date. Where something is logically a date not a datetime, it will appear as a datetime at midnight at the start of that day.

### Special characters

`DUID` is the identifier for a generator. 
Some DUIDs contain funny characters, such as `W/HOE#2` for Wivenhoe Power Station. 
This slash and hash can cause errors with misleading error messages. (e.g. if you are saving files to disk with hive partitioning on the `DUID` key.)

There are a few obscure tables (which researchers do not normally look at, such as the Market Suspension Notices in `MARKETNOTICEDATA`) which contain newline characters within the cell values (escaped with double quotes around the whole value).
Most CSV parsing libraries can handle this. I am mentioning it just in case you are trying to read the data with something simple like:

```
with open('data.CSV', 'r') as f:
    headers = f.readline().strip().split(',')
    for data_row in f:
        cells = data_row.strip().split(',')
```

If you do that, it will work for the vast majority of tables, but not `MARKETNOTICEDATA`.

## How to query and understand the data

### Deduplication

TODO

LASTCHANGED

### Missing Data

TODO

### Understanding Timestamps

Timestamps generally refer to the _end_ of the period, not the start.
e.g. a `SETTLEMENTDATE` of "2025/01/02 03:05:00" refers to the period from 3:00 to 3:05.

Pay attention to the documented definition of each field.
For some power values it is the average across the 5 minute period.
For most power values it is an intantaneous power value at the end or start of the period.

`INITIALMW` refers to the power at the start of the period. `TOTALCLEARED` refers to the power at the end of the interval. 
"Cleared" refers to what AEMO instructs or predicts. AEMO's plan is that generators will take the entire period to adjust their output, linearly.
This is described in more detail in [my thesis](../diagonal-dispatch).

Some fields are logically dates not datetimes. However they will still appear in the data as datetimes,
at midnight at the start of the day.

### Timezones

All timestamps are in "market time", i.e. `Australia/Brisbane`, `UTC+10`, with no daylight savings,
even for data which applies to regions in other time zones.

(Note that if Queensland ever adopts daylight savings, it is likely that a lot of IT systems in the electricity sector will break in a Y2K kind of way,
because many people configure the timezone as `Australia/Brisbane` when it is _technically_ suppoesd to be `UTC+10`.)

### 5 vs 30 minutes

The NEM operates on a 5 minute schedule.
This was not always the case.
Prior to October 1st 2021 there was a mix of 5 and 30 minutes.
Bids were submitted with 5 minute granularity, and were evaluted every 5 minutes, to produce a "dispatch price" every 5 minutes, and tell generators what power level to generate at every 5 minutes. However generators were _paid_ based on the half-hour average of 6 5-minute prices, called the "trading price". (This was a historical design choice, from when computers were less powerfull.) This led to some perverse distortions, where after a ceiling price event (e.g. + 15,000 $/MWh), every generator would bid to the floor (- 1,000 $/MWh) for the remainder of the half hour, because the _average_ would still be very high.
So if you are querying data from prior to October 1st 2021, check each table to see whether the frequency of rows changes to half-hourly back then.

Even today, some tables still have a half-hour granularity. (e.g. some price forecasts, and rooftop solar power). So always check the data before writing your queries.

### Region ID

Regions are the states of the NEM.

- `QLD1`: Queensland
- `NSW1`: New South Wales and the ACT, lumped into one region (same price)
- `VIC1`: Victoria
- `TAS1`: Tasmania
- `SA1`: South Australia

Note that all the regions end in `1`. If you find your query returns empty results, make sure you did not filter by just `NSW`, but instead `NSW1`.
This `1` is because they thought that one day in the future regions might be split up.

The only time I have seen regions ending in something other than `1` is in `ROOFTOP_PV_ACTUAL`. That contains `QLD1` (all of Queensland) as well as `QLDC`, `QLDN`, `QLDS`. My guess is that these are Central, Northern and Southern Queensland. 

I have seen some older data with `SNOWY1`. This region was merged into `NSW1` many years ago.

### DUID, Genset ID etc

`DUID` is the identifier for each generator, battery, and scheduled loads.
As mentioned [earlier](#Special characters), this can contain funny characters such as `/` and `#`.
For some data you have a smaller granularity, at the "station" or "unit".
Relevant tables for joining these together are `DUDETAILS`, `DUDETAIL`, `DUALLOC`, `STATION`, `STATIONOWNER`

### Generator Fuel Type

TODO

### Intervention

AEMO takes all generators' bids, transmission line constraints, demand forecasts etc, and they plug it into a big linear optimiser called the NEM Dispatch Engine (NEMDE), which finds the economically optimal solution. (e.g. Maybe the grid cannot get power from the cheapest generator to the consumer, so a more expensive generator elsewhere is used instead.) Sometimes the complexity of the electrical grid cannot be represented nicely in mathematics. In those cases AEMO manually intervenes to tweak the results. This is called "Intervention". 
The data often contains both the pure-math result, and the actual result.
Unless you are researching Interventions specifically, **if a table contains an `INTERVENTION` column, you should filter by `INTERVENTION == 0`, dropping `1`.**
Interventions are rare, but the values in `INTERVENTION==1` rows may be drastically different to the `INTERVENTION==0` rows.

There is a slightly different adjustment called "Direction", which is harder to see in the data.
If you find 'out of merit' dispatch happening, Directions and Interventions are one reason why.
e.g. A huge amount of gas generation in South Australia happens when the price is below the gas generators' bid/cost, because there is a requirement to always have a minimum amount of gas generation running. (As an aside, this metric is crudely defined, and this limit drastically limits the decarbonisation impact of additional solar and wind, yet was notably absent from the discussion about nuclear power.)

### RRP

This is 'the price'. It does _not_ stand for "recommended retail price". It stands for "Regional Reference Price".

`ROP` is the "Regional Override Price".

Within a region (e.g. within NSW), transmission constraints may hinder the ability to transmit power from one generator to a load in the same region.
"Local prices" incorporate transmission constraints to provide the theoretical marginal cost of increasing power at each node in the network.
However (for now) generators are not paid this price. This price is useful only to understand why generators may be constrained on (forced to generate even when paid less than their bid) or constrained off (forced to not generate even though their bid is lower than what they will be paid).
The controversial "COGATI" proposal is to transform the NEM into a nodal network, such that generators are paid the local price, not regional price. That debate is outside of the scope of this article. Just note that this has not come into effect at the time of writing (late 2025), and is unlikely to be implemented within the next few years.

You can find an explanation of price setting in [Watt Clarity](https://wattclarity.com.au/articles/2019/02/a-preliminary-intermediate-guide-to-how-prices-are-set-in-the-nem/).

### Import/Export


Interconnectors are the transmission links between the regions.
Sometimes they are the kind of transmission line you would expect, with a few cables strung between a line of towers.
Sometimes they are more of an abstraction over several smaller lines, as a ["hub and spoke" simplification](https://wattclarity.com.au/articles/2019/03/price-setting-concepts-an-explainer/).

Interconnectors are bidirectional. In terms of the data, positive export values mean that data is flowing **away from Tasmania**.

- TAS1 to VIC1
- VIC1 to SA1
- VIC1 to NSW1
- NSW1 to QLD1

Negative values are the opposite direction.


### Losses

You may see terms such as "marginal loss factor" (MLF), "transmission loss factor" (TLF) or "distribution loss factor" (DLF).

Even within one region, power generated by one generator will be partially lost in transmission before reaching the consumer.
MLF and TLF account for this.
The real grid topology is very complex, so AEMO models the grid as a "hub and spoke" model, where all loads and generators are directly connected with individual, lossy lines to an imaginary central reference node within each region. 
In this model 

Loss factors are typically slightly smaller than 1. Sometimes they are exactly 1 (e.g. a generator connected directly to the transmission network instead of a distribution network will have a DLF of 1.) In rare cases they may be slightly about 1.

AEMO has already applied these loss factors to most data, which appears as if the generator were at the regional reference node.
So you can generally ignore it.
One case where you would care is if you want to know how much a generator provided including power lost in transmission, as opposed to knowing how much _usable_ power there is. You would have to divide the power values in tables such as `DISPATCHUNITSCADA` by a loss factor in `DUDETAILS`.
Another context is when dealing with private settlement date.
This is described in more detail in [Watt Clarity](https://wattclarity.com.au/articles/2019/03/price-setting-concepts-an-explainer/).

### TRK Tables

There are many table names ending in `TRK`.
These contain metadata about version history. 
(e.g. `STATIONOWNERTRK` contains version history metadata for `STATIONOWNER`.)
You probably do not need to look at them.

## Common Queries


### Rooftop Solar

Unlike most generation, rooftop solar is not directly measured. (Even in Victoria, where smart meters are mandatory.)
Instead AEMO estimates how much power is, was or will be generated by rooftop solar.
Typically AEMO (and most grid operators) treat solar power as negative consumption, due to the unique data provenance.
This leads to funny things like "negative" demand.

For most analysis, I recommend doing the work to get rooftop solar data, and adding it to other generation.
Suppose you want to analyse some data from Australia's national electricity market, to see our current fuel mix. To figure out the fuel mix, you take the per-generator power `DISPATCH_UNIT_SCADA` (or `DISPATCHLOAD`), and join that to a list of generators with fuel type and region (e.g. the [particpant registration list](https://github.com/UNSW-CEEM/NEMOSIS/wiki/AEMO-Tables#generators-and-scheduled-loads-generators-and-scheduled-loads)). Then you can do a simple group by and sum up the energy. You will find that 8.4% of South Australia's generation in 2024 was from solar.
But this is actually not correct. 
Once you add rooftop solar, you see that actually 28.4% of South Australia's generation in 2024 was from solar. 
Without that, you would be wrong by a factor of 3. 

<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:7293600955600678913?collapsed=1" height="670" width="504" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>

Rooftop solar data takes a bit of work to get.
It is 30 minute granularity. So do not forget to upsample it.
If you append it to large-scale generation data without upsampling, you will have 0 for 5 out of every 6 intervals.

You should filter out `REGIONID`s which do not end in `1`, as described [earlier](#Region ID).

There are also overlapping rows because data comes from several different estimation methods, in column `TYPE`: `DAILY`, `MEASUREMENT`, `SATELLITE`. `SATELLITE` is the most accurate, so take that if it is available. `MEASUREMENT` is the next most accurate. Luckily this is reverse alphabetical order.
`QI` is a quality indicator.
I am unsure, but I think you should take the best `TYPE`, and then break ties by taking the highest `QI`.

As an example, here is how to get deduplicated 5-minute rooftop solar data with Polars:

```
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
```

Unfortunately upsampling from 30 minutes to 5 minutes generally requires that you have all the data in memory.
For Polars this means you can't stream, so I call `.collect()` first. This particular table is small enough that this is generally not a problem.
If it is a problem, or just too fiddly, a workaround is to duplicate the data 6 times, adding N * 5 minutes to each timestamp, then concatenating them vertically. (Making sure that you duplicate power, not energy.)

### Grouping By Fuel Type

TODO

### Bids


Bid category - case sensitive


Timestamps aren't validated by AEMO
Some of the bidding data contains millisecond granularity, and some bidding fields contain a time without a date.
For bidding data specifically, there are some fields where AEMO do not validate the timestamps given to them. So you may encounter invalid and inconsistent date formats there.

TODO



## I Feel Your Pain

As you delve into the world of AEMO's data, you will come across countless inconsistencies which will drive you mad.
You need to be prepared to roll with the punches.
Just remember to be thankful that we have this data at all.
I do not know of any other grid or industry with this much public data.

Examples:

- AEMO publishes new schemas about twice a year. They have a well defined system, with consultation (with market partitipants), and clear major and minor version numbers. They often add new columns, but rarely delete old ones or change column order. The `DISPATCHREGIONSUM` table has several columns a the end about aggregate renewables. Despite sounding promising, these are always empty. When I asked why, I was told that it's something they plan to add in the future. So they are effectively adding this column in a way which is outside their normal schema versioning process for adding new columns.
- AEMO have standard file formats for most of their data. However for some data (e.g. price setter data, or 4 second scada data) they choose something different, like XML.
- AEMO have the MMS dataset, which contains hundreds of different tables. However for some data (e.g. the [Participant Registration List](https://aemo.com.au/energy-systems/electricity/national-electricity-market-nem/participate-in-the-market/registration)) they publish it as an excel file on their aemo.com.au web page. For most of AEMO's data, they keep all version history (e.g. each iteration of a price forecast). However when generators retire, they are [deleted from this registration form](https://github.com/UNSW-CEEM/NEMOSIS/wiki/AEMO-Tables#generators-and-scheduled-loads-generators-and-scheduled-loads), instead of just adding a column to mark them as retired.
- Additionally in this [list of generators](https://aemo.com.au/energy-systems/electricity/national-electricity-market-nem/participate-in-the-market/registration):
    -  all batteries are listed with a "Fuel Source - Primary" of "Battery Storage", except for the Hornsdale battery, which is listed as "Wind". (Probably because it was the first battery, and the registration rules have changed since then.)
    - The interconnector between Tasmania and Victoria (Basslink) is in the registration list. Other HVDC interconnectors are not listed.
- Some batteries are registered as one DUID, some are two (one for charge, one for discharge). Even when there are two, the power values can be both positive and negative for both of them.    
- Typically each monthly file ends with the 5 minute period before the 5 minute period that the next month starts with. Except for one month where they overlap.
- For some months, some tables are missing. They are present for earlier and later months.
- Up to July 2024 the filenames on nemweb were like `PUBLIC_DVD_ANCILLARY_RECOVERY_SPLIT_202309010000.zip`. Then the month after that they changed to `PUBLIC_ARCHIVE#ANCILLARY_RECOVERY_SPLIT#FILE01#202409010000.zip`, thus breaking any webscraping.
- The [`INTERVENTION`](#Intervention) column is always a `1` or `0`, although the schema documentation says they can take a range from 0 to 99.  _Except_ for table `GENCONSETINVOKE`, where it is a `VARCHAR2(1)` with values `Y` or `N` (even though the documentation comment says it is `0` or `1`).
- Data types in the documentation are normally like `NUMBER(2,0)`, but sometimes they are `Number(2,0)` or `Number (2,0)`
- The `MAXCAPACITY` and `REGISTEREDCAPACITY` columns in `DUDETAIL` are described as integers in the schema documentation. However in the actual CSV data they are floats, with non-zero decimal parts. If you use AEMO's PDR Loader, you will lose the decimal part. (I notified AEMO about this. They said it is not a bug.)
- The [list of tables](https://nemweb.com.au/Reports/Current/MMSDataModelReport/Electricity/Electricity%20Data%20Model%20Report_files/Elec80_8.htm) in the documentation sometimes has spaces in the middle of table names. (e.g. `SET_APC_COMPENSATION` used to appear as `SET_ APC_COMPENSATION`, thus making it difficult to find the table you want with ctrl-F)
- Sometimes the column names in the CSV do not match the documentation. e.g. for table `DISPATCHCONSTRAINT`, the documentation says `DUID`, but the actual CSV has column `CONFIDENTIAL_TO`. The documentation for table `MTPASA_REGIONRESULT` says there is a column `TOTALSEMISCHEDULEGEN10`, but the actual CSV contains `TOTALSEMISCHEDULEDGEN10` (with an additional `D`).

(These last few issues are why I suspect AEMO does not have a foundational machine-readable schema as their source of truth from which they could programatically generate documentation, code, data files etc to guarentee correctness and consistency.)

## Further Reading

AEMO implements the National Electricity Rules (NER) written by the Australian Energy Market Commission. These rules are available [here](https://energy-rules.aemc.gov.au/ner/714).

[Watt Clarity](https://wattclarity.com.au/) is a blog by a market consultant (Global Roam). They have:

- explainers for concepts such as "how is the price set?", "what is FCAS?" ([example](https://wattclarity.com.au/articles/2022/09/analyticalchallenge-installedcapacity/)),
- analysis of market trends and policies,
- autopsies of specific events ('what happened last Tuesday?')

Whilst they are a business trying to sell consulting services and market reports, I find the free content on their site to be very high quality, useful and unbiased.

The benefits of Parquet over CSV are described in [R for Data Science](https://r4ds.hadley.nz/arrow#advantages-of-parquet). (Apache Arrow has similar benefits.)

## Where to Next

If you have questions, reach out to me on [Linkedin](https://www.linkedin.com/in/mdavis-xyz/), or [raise an issue](https://github.com/mdavis-xyz/mdavis.xyz/issues) on the GitHub repo for this website.
