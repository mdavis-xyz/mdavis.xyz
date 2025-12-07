This guide is for researchers who want to analyse data about Australia's electricity industry. 
Fortunately there is far more public data available for this sector than almost any other industry, or even any other country's electricity market. 
Unfortunately there are many undocumented aspects of the data which can trip up newcomers. 
The purpose of this post is to highlight some of those 'gotchas'.

The focus here is on how to dive deep into the data, for those who intend to spend hours performing bespoke analysis, mostly for queries which require data on a timescale smaller than 1 day.
Before you spend the time on this, first check whether you can quickly obtain the data you want from [Open Electricity](https://explore.openelectricity.org.au/energy/nem/?range=7d&interval=30m&view=discrete-time&group=Detailed). Other high-level statistics are available from the [AEMO Data Dashboard](https://www.aemo.com.au/energy-systems/data-dashboards) and the [IEA](https://www.iea.org/countries/australia).
With those sources you can quickly answer questions like:

- What is the current fuel mix (i.e. % coal, % solar etc), and how has that changed over time?
- How much CO2 was emitted last year?
- What is the volume-weighted average price of gridscale solar last month?
- What is the spot price of electricity right now?

If you want to answer something more bespoke and complex, this guide explains how.

This article also includes a quick overview of the design of the market. 
I will list some acronyms and terms which newcomers will not be familiar with.

I do not expect anyone to read this from top to bottom.
Rather, you should read the first few sections, then skim the rest, using ctrl-f or an LLM to find relevant content.


## Quickstart

- The list of all tables and their contents is [here](https://nemweb.com.au/Reports/Current/MMSDataModelReport/Electricity/Electricity%20Data%20Model%20Report.htm).
- First try to download and extract the data with [Nemosis](https://github.com/UNSW-CEEM/NEMOSIS) if you can. Otherwise write your own code to do so, as described below.
- Once you have queryable data, jump to [How to query and understand the data](#how-to-query-and-understand-the-data) and [Understanding the Market Structure](#understanding-the-market-structure).

<!-- The table of contents is populated at runtime with JavaScript -->
<div id="toc">
</div>

## What data is available?

Australia's National Electricity Market (NEM) includes Queensland, New South Wales, the ACT, Victoria, and South Australia. The market is operated by [the Australian Energy Market Operator (AEMO)](https://www.aemo.com.au/). (Typically "AEMO" is used in sentences on its own, instead of "the AEMO".)
The NEM does not include Western Australia or the Northern Territory. Those are separate grids, with separate data. The Western Australia Market (WEM) is also operated by AEMO, but the market rules, data schemas and data pipelines are different. This post is focused on Australia's NEM, and the data in the "Market Management System" (MMS) dataset.

The publicly available MMS data is very comprehensive.
If you have experience with data from other electricity markets/grids, you will be pleasantly surprised by how much data there is.
If you are an academic with a research question, and you have not yet chosen a particular grid, you should probably just choose Australia because the data availability is so good.

The data includes:

- Prices (every 5 minutes)
- Price forecasts (every 5 minutes, for the next few 5 minute intervals, and less granular forecasts up to 2 days in advance)
- Total energy generated/consumed, every 5 minutes
- Energy generated, per generator, per 5 minutes (also 4 second granularity if you need it)
- Detailed fuel type of each generator (so you can calculate energy, revenue, capture price etc grouped by fuel type)
- Transmission flows between regions
- CO<sub>2</sub> emissions, per generator or per region, at a daily level
- Raw bids and rebids of each generator, including a category and sentence justifying each bid
- Constraints: AEMO does not just intersect supply and demand curves. Australia's grid is far more constrained than most, so AEMO's optimiser, the "NEM Dispatch Engine" (NEMDE) incorporates hundreds of constraints for system strength, transmission line capacity etc. The definition and evaluation of these is in the data.
- Ancillary services: These are [defined below](#what-is-fcas). The data includes bids, and how much capacity is made available each period, per generator and in aggregate. Finding out how much was _used_ is difficult, but possible.

You can estimate the energy revenue of each generator. The exact invoice amount each participant is paid is not public. (Generators are paid for their energy, but they also pay a wide range of fees, e.g. for wind/solar forecast inaccuracies.) You can estimate this amount to within a few percent. However doing so requires a great deal of expertise, which is beyond the scope of this post. Estimating just energy revenue/cost is straightforward.

The MMS dataset does not include information about green products such as Australia carbon credit units (ACCUs). For that data you will need to search elsewhere.

This dataset also does not include any information about the _cost_ incurred by each generator, only their output and revenue.
For estimates of costs, you can look at the [CSIRO's GenCost model](https://www.csiro.au/en/research/technology-space/energy/Electricity-transition/GenCost), or [AEMO's System Plan](https://www.aemo.com.au/energy-systems/major-publications/integrated-system-plan-isp/2024-integrated-system-plan-isp).

Most data is published publicly every 5 minutes. Some sets of commercially sensitive data are published with a deliberate delay of a few days (e.g. bids).
The online dataset goes back to 2009, although some tables within that do not go back as far. 


### The Tables

AEMO's dataset contains many different 'tables'. They are called this because AEMO expects market participants to load the data into tables in a SQL database. 
(If you are an analyst querying CSV/parquet files with Pandas, these may each be a different dataframe. The concept is the same.)
There are hundreds of tables available to market participants. Some of those are not available to the public (e.g. settlement data), but most are.
The most important ones are:

- `DUDETAILSUMMARY` contains some static data about each generator (e.g. which region they are in)
- `DISPATCHPRICE` - for energy and ancillary prices
- `P5MIN_REGIONSOLUTION` - for short term price and energy forecasts
- `DISPATCH_UNIT_SCADA` - per-generator power output at the start of each 5 minute interval
- `DISPATCHLOAD` - despite the name, this is for both generators and loads. This is per-generator power (both actual, and what they were supposed to do), ancillary service dispatch (what they were supposed to be able to provide if called upon, but not whether they were actually called upon)
- `DISPATCHREGIONSUM` - This contains region-level power, both actual and planned. This is for both generated, consumed and imported/exported power, as well as ancillary services. A few of the columns about total renewable output/capacity are always empty, unfortunately.
- `BIDDAYOFFER`, `BIDOFFERPERIOD`, `BIDPEROFFER_D`, `BIDDAYOFFER_D`, `BIDPEROFFER`: Raw bids by generators. These are very large, up to 2 TB uncompressed if you download 10 years of data. They are also very complex to understand. A dedicated section explains them [further down](#bids).
- There is [**4 second** granularity power data](https://github.com/UNSW-CEEM/NEMOSIS/wiki/AEMO-Tables#four-second-fcas-data-fcas_4_second) for every generator, as well as some other data (such as grid frequency). This is exceptionally large, and in a different location and format to the other data.


Some other important tables are listed in the [Nemosis wiki](https://github.com/UNSW-CEEM/NEMOSIS/wiki/AEMO-Tables).

There are conceptually related groups of tables. 

- `DISPATCH*` refers to the actual decisions from NEMDE's market clearing. This includes the actual price (could be energy or FCAS), power targets from AEMO ("cleared") per generator, or per region, interconnector flows between regions etc.
- `PREDISPATCH*` and `P5*` refer to AEMO's predictions for the near term. (Each revision of these predictions is stored in perpetuity, so you can see how predictions change over time for a given interval.)
- `ANCILLARY*` refers to [`FCAS`](#what-is-fcas).
- `PASA`, `STPASA`, `MTPASA` refer to medium term (multi-day) to long term (multi-month) predictions
- `SETTLEMENT*` refers to invoicing data, which is typically private
- `GBB` is about gas
- `CONF*` is about configuration for [PDR Batcher and Loader](#pdr-batcher-and-pdr-loader)
- `FORCE_MAJEURE` and "market suspension" are about black swan events (e.g. a few times per decade)
- `PRUDENTIALS` refers to a concept about the credit-worthiness of market participants. (e.g. retailers may need to prepay for their customers' consumption during an exceptionally high-priced week)

### CO2 Emissions Data

Emissions data is elusive.
The `GENUNITS` table contains emissions intensity per generator (which you can then join with power data to get emissions).
I have found region-level daily emissions data in undocumented tables.
The detail of where to find these undocumented files, and an example query is shown [later](#emissions-data).

## Understanding the Market Structure

If you are already familiar with the market design and just want to read about the data, skip ahead to the [next section](#where-is-the-documentation).

Compared to other countries, Australia's electricity market is very simple.
Other markets can feel like this:

[![xkcd comic](xkcd-annotated.png)](https://xkcd.com/2677/)

For example, Germany cannot directly subsidise renewables, because of EU state aid laws.
So the government offers contracts for difference (CfDs) to shield investors from the risk of low wholesale prices. They block low price signals from reaching generators by inserting the taxpayer's wallet in the middle. 
The generators respond to the artificially-high prices which they see in the way you would expect any business to, by producing more. This drives the wholesale price down, which causes fossil fuel generators to produce less, which is the point of the policy.
However the government does not like prices below zero, so they added carveouts to halt CfD payments during negative prices.
Now solar/wind investors are re-exposed to the risk of low prices, even though shielding them from that risk is why these CfDs were created.

Australia's market is far simpler.
The NEM is an "energy only" market.
(Well, almost. The federal and state governments keep fiddling with the nicely designed market by adding some [capacity products](https://www.hachiko.energy/blog/alternative-sources-of-revenue), CfDs and other patchwork schemes. See my [master's thesis](../masters-thesis/) for an explanation of why capacity markets are unnecessary in a market with such a high ceiling price.)
There is no day-ahead market. AEMO publishes forecasts every 5 minutes which guide the market participants, and then everyone is paid (or pays) the one energy price.

A note on terminology: 
where academic economists say "supply" and "demand", in the industry we tend to say "generation" and "load".

### Prices

Energy prices have a legally defined maximum "ceiling". This is indexed each year, and is currently around 20,000 $/MWh. This is far higher than most countries. (To understand why this is a great thing, see [my master's thesis](../masters-thesis).)

The minimum is below zero, at -1000 $/MWh (not indexed). Yes, prices can go negative. South Australia has [the most negative electricity prices in the world](https://www.iea.org/reports/electricity-2025). It is unusual to have a day in Australia _without_ negative prices at some point. 
From a data science perspective, this means that taking logarithms of the price to do regressions does not work.

Electricity prices are very volatile.
Price and revenue data is highly skewed. Outliers are of central importance.
For example, it is normal for a generator to make as much profit in the top 10% highest-priced hours each year as the rest of the year combined.
(I show this with an [example query](#revenue-skewness) later.)
I have seen [a consultant's report](https://houstonkemp.com/wp-content/uploads/2020/02/27_Impact-of-gas-powered-generation-on-wholesale-market-outcomes-final-results-presentation.pdf) commissioned by AEMO where they simply deleted intervals with negative prices and very high prices. Do not do this. This is incorrect and will give you meaningless results.

### Predispatch is Not a Day-Ahead Market


::: {.callout .tip}
The NEM does not have a day-ahead market.
:::

"Trading days" start in the 4:00-4:05 interval, and finish in the 3:55-4:00 interval the next calendar day.
Participants need to submit bids each trading day by 12:30pm. They can submit bids much further in advance.
If no bids are submitted for a given day, AEMO copy-pastes the last bid which was submitted for that participant.
AEMO takes these bids, and a prediction of load, rooftop solar output etc, and runs the same code they use for the actual real-time dispatch, but in advance.
From this they can predict prices, and the power flows from each generator, across each transmission line, whether constraints are binding etc.
This is called "predispatch". (Whereas "dispatch" is the actual live instruction and price every 5 minutes.)
This prediction is updated every 5 minutes, for the next 24-48 hours. (The specific tables are described [later](#price-predictions).)
 
The crucial thing to understand here is that this is merely a prediction for planning purposes.
No generator is paid at the predispatch price, so it is not a real price, nor a real market.

The 12:30pm cutoff is not as important as it sounds.
After the 12:30pm cutoff, generators can still "rebid".
The only two restrictions on "rebids" vs "bids" are:

- Rebids must have a justification (a letter to represent a category, and a sentence), although in practice this is often as vague as "Changed market conditions".
- A bid is a spreadsheet where each row is a time interval (288 5-minute intervals), and each column is a "price band". The price of each price band cannot be changed after the 12:30pm cutoff. However participants can still shuffle quantity between bands. With 10 bands, that is a lot of flexibility.

Rebids can be submitted at any time. There is no "gate closure".
For example, a generator can submit a rebid at 01:04:50 for the interval 01:05-01:10, and it will be accepted. (There are a few seconds of lag for IT reasons, not regulatory ones. So 01:04:59 may be too late.)  From 01:50:00 AEMO will start their calculations based on all the bids and other information they have. They will publish dispatch instructions (power levels) and prices around 01:05:10 to 01:05:40. (Note that technically AEMO tells generators what to do several seconds _after_ they are supposed to have started doing it.)

The timeline for bids and rebids is explained by [Watt Clarity](https://wattclarity.com.au/other-resources/glossary/rebids/).
Bid data is discussed in more detail [later](#bids).
If you want a more cite-able source about the lack of a day-ahead market, check out [this interesting paper](https://journals.sagepub.com/doi/10.5547/01956574.45.1.jgil) by Gilmore, Nolan and Simhauser, where they estimate the levelised cost of FCAS.

### Two-Dimensional Time

AEMO's data often contains predictions of the future.
e.g. price, power flows, constraint binding.
These predictions are updated often, yielding a history of different versions of predictions which apply to the same interval.
In the data this means you may see two datetime columns.

Here is a screenshot of a paid application called ez2view (which takes MMS data and displays it graphically), by a company called [Global Roam](https://home.global-roam.com/) (the authors of [Watt Clarity](https://wattclarity.com.au)).
The screenshot is from [this article](https://wattclarity.com.au/articles/2020/08/casestudy-19th-December-2018/).
Each cell in this table is a prediction of price from predispatch.
Each column is a time interval which the prediction applies to.
Each row is a time when the prediction was made.
The screenshot graphically shows how predictions changed over time.

[![Screenshot of ez2view](forecast-triangle.png)](https://wattclarity.com.au/articles/2020/08/casestudy-19th-December-2018/)

The top-left corner of the graph is blank, because these would be "predictions" of the past (which do not exist).
The bottom-right corner is blank because these are predictions of the distant future, which do not exist.
(Or at least, not in this MMS table, which only goes out one hour. For predictions further out, see the [price prediction section](#price-predictions) further down.)
Every 5 minutes, AEMO publishes a new set of predictions, which appear as a newly inserted row up the top of this graph.
Each row is shifted one interval to the right, because the start and end of the predictions are for intervals which will occur 5 minutes later.

For example, the third row is mostly blue (relatively high values).
This means that around 10:51 (2 intervals before the one ending at 11:05) AEMO predicted high prices for the next 12 5-minute intervals (10:50-10:55 until 11:45-11:50).
The red "30" value at the start of row 2 shows a relatively low value. The cell below (71) is blue. This shows that the final price of 30 was a surprise (30 is far lower than 71).

If you are looking at historical predictions and wanting to know what market participants expected at a certain time, you will need to find the latest row of data in this graph (e.g. `RUN_DATETIME < t` in `P5MIN_REGIONSOLUTION`, or sometimes `LASTCHANGED`) and then use a different column (e.g. `INTERVAL_DATETIME` or `SETTLEMENTDATE`) to see which interval it applied to. Later on there is an [example query](#price-predictions) showing this.

[Watt Clarity](https://wattclarity.com.au/articles/2022/09/analyticalchallenge-dimensionoftime/) also explain this concept.

### Scheduled Vs Non-Scheduled

A "scheduled" generator is one which submits bids to AEMO, and is told what power level to produce at by AEMO, every 5 minutes.
Most big generators are scheduled.
Most loads are non-scheduled (you do not talk to AEMO before turning on your dishwasher). Some large loads (such as smelters) are scheduled.

A "non-scheduled" generator generates whenever it wants. These tend to be small hydro plants and biowaste generators.
If you find a generator mentioned in some tables but not others, it may be non-scheduled.
To find out, check the [NEM Registration and Exemption List](https://aemo.com.au/energy-systems/electricity/national-electricity-market-nem/participate-in-the-market/registration).

A "semi-scheduled" generator is a type of scheduled generator where the instruction from AEMO to generate a certain power level is a one-sided upper limit. This is for wind and solar, which are allowed to produce less after an unexpected drop in wind/sunshine, but sometimes must waste extra power when there is an unexpected increase in wind/sunshine.

Rooftop solar is none of these categories. It is treated as negative load. This is described later in the [Rooftop Solar](#rooftop-solar) section.


### What is FCAS?

"Frequency Control and Ancillary Services" (FCAS) are additional markets for non-energy products.
Of course they still involve moving electrons down wires to transmit watts and joules. 
However the objective of these services is not to transmit energy from a generator to an consumer's device, but rather to keep the grid running.
You can think of them as "reliability services".

- "Regulation" is about adjusting generated power levels to mirror the natural fluctuations in consumption within each 5-minute period.
- "Contingency" is about reacting quickly when things go wrong. e.g. When the Callide C plant [had a fire](https://x.com/CSEnergyQld/status/1397057131656871942), their power output dropped unexpectedly. Consequently grid frequency [dropped outside the normal bounds](https://wattclarity.com.au/articles/2021/01/13jan2021-bothunittrip-callidec/), and other generators had to quickly increase their output to fill in the shortfall. Only some generators are physically able to do so.

In Australia, generators providing FCAS are paid for being ready. If the FCAS capacity is not needed, they are still paid. If it is needed, the only additional payment is for the increase/decrease in energy they provide, at the normal energy price.
This pricing approach is discussed in [my master's thesis](../masters-thesis/).

Similar services in other countries are called "balancing", "mFFR", "aFFR", "FCR", "raise", "lower" etc. 
The problems being solved are the same, but the mappings between products are not one-to-one.
For a more detailed introduction to Australia's FCAS market, see [this interesting paper](https://journals.sagepub.com/doi/10.5547/01956574.45.1.jgil) by Gilmore, Nolan and Simhauser about estimating the levelised cost of FCAS.

The time spans of contingency FCAS products are:

* "Very Fast" - 1 second
* "Fast" - 5 seconds
* "Slow" - 60 Seconds
* "Delayed" - 5 Minutes

The directions are:

* "Raise" - Frequency is too low. We need to raise frequency by raising generation output or lowering load
* "Lower" - Frequency is too high. We need to lower the frequency by lowering generation output, or raising load

To understand the relationship between power and frequency, see my [bachelor's thesis](../thesis).

In the data you will find combinations of these timescales and directions.
For example, in `DISPATCHPRICE`, `RAISE60SECRRP` is the regional reference price of the 60 second raise product.
The 1 second products were introduced relatively recently, so sometimes in the data and documentation those columns are not adjacent to the others. For data prior to [9 October 2023](https://www.aemo.com.au/energy-systems/electricity/national-electricity-market-nem/system-operations/ancillary-services/very-fast-fcas-market-transition), those columns will be empty (or missing). If you use Nemosis and find it missing for recent data, use [this trick](https://github.com/UNSW-CEEM/NEMOSIS/issues/37) to add it.

It seems that most academic researchers ignore FCAS, because it is technically complex.
I believe this is unwise.
FCAS is important, and increasingly so.
For many years, batteries earned more profit from providing FCAS than energy. (See [Watt Clarity](https://wattclarity.com.au/articles/2024/03/state-of-charge-a-peek-into-the-economics-and-performances-within-the-nems-battery-fleet/).)
In a world with a huge amount of zero-marginal-cost renewables, energy profits would be approximately zero most of the time. Most profit would come from the few periods of ceiling price spikes during scarcity, and from the FCAS services keeping the low-inertia system stable. If your research question is about what the future will look like, especially in high-renewables scenarios, you should consider FCAS.

There are some obscure ancillary services which are not FCAS (e.g. black start). 
These are typically handled through bespoke procurement on the timescale of years, and do not appear in the MMS dataset.

If you ever encounter the string `ENOF`, this refers to energy.
(I suspect it stands for "ENergy OFfer", but that is just my guess.
See the [`BIDTYPES` table](https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/2025/MMSDM_2025_10/MMSDM_Historical_Data_SQLLoader/DATA/PUBLIC_ARCHIVE%23BIDTYPES%23FILE01%23202510010000.zip).)

### How are Batteries Treated?

Battery data is often counterintuitive and inconsistent.
I suspect this is because the rules about batteries have evolved over time.
For example, the first battery (Hornsdale) is actually [classified as a wind generator](#i-feel-your-pain).

If you look at the list of [registered participants](https://www.aemo.com.au/energy-systems/electricity/national-electricity-market-nem/participate-in-the-market/registration) (file "NEM Registration and Exemption List", sheet "PU and Scheduled Loads") you will see some assets listed with a "Dispatch Type" of "Bidirectional Unit". These are all batteries.
Although one battery (Kennedy Energy Park) is listed as a "Generating Unit" (DUID `KEPBG1`) for discharging, and a "Load" (DUID `KEPBL1`) for charging. (This particular battery is actually [non-scheduled](#scheduled-vs-non-scheduled).)

Sometimes generators show negative power levels. e.g. a solar farm needs to draw a trickle of power to 'keep the lights on' during the night. (This is for the local IT systems, but also can be iron losses in the transformer.)
Less intuitive is that loads can have both positive and negative values. I still do not understand why this can happen, especially for a bidirectional unit which has been split.
In these cases I tend to try to use heuristics to figure out the convention. (e.g. is the sum of negative values larger or smaller than the sum of positive values? Do I expect this DUID to generate/consume more, a lot less or slightly less than it consumes/generates).

As more and more sites colocate wind/solar with batteries (despite the [lack of spot revenue benefit](../colo/)), analysing the data for these will become increasingly difficult.

### Wholesale Demand response

The NEM does have a formal demand response market at the wholesale level.
("Wholesale Demand Response", or "WDR".)

The point of electricity retailers is that they hedge consumers against volatile spot prices.
The purpose of the WDR market is to let consumers re-expose themselves to the spot market, selling ["negawatts"](https://wattclarity.com.au/articles/2019/10/all-aboard-the-negawatt-express/) at high spot prices.
It is simple in theory, but complex in practice.

In terms of the data, you may see WDR participants (including aggregators) in the data where you expect generators. Since these are not real megawatts, you often need to drop these rows.
e.g. If you want to find the fraction of energy generated by a particular fuel type, you should exclude WDR values in the denominator, because that energy is not real, it is counterfactual.

In practice the total volume of the WDR market (and other demand response schemes too) is smaller than other countries.


### Constraints

In Economics 101 we are taught that price and quantity is set by the intersection of supply and demand curves.
In electricity markets the aggregate supply curve is explicitly uploaded to the market operator (e.g. AEMO).
The market operator also has the demand curve from scheduled loads, and they add a prediction of unscheduled load (i.e. most load) at the ceiling price for the rest of the aggregate demand curve.
However the intersection of these two curves is [rarely](https://wattclarity.com.au/articles/2019/02/a-preliminary-intermediate-guide-to-how-prices-are-set-in-the-nem/) the actual price.
In practice we are physically unable to get power from the cheapest  generator to the marginal consumer.
(If we always could, it means we are spending too much on network infrastructure.)

Sometimes this is because transmission wires only have a certain maximum capacity.
Sometimes there are other more complicated constraints about voltage, fault levels, inertia etc.

AEMO accounts for these directly in their decision, as algebraic constraints considered by linear optimiser software.
(This is a much more efficient approach than the typical European one, where constraints are ignored during bid clearing, then adjustments are made afterwards to account for them.)

Australia's grid is much more constrained than most  grids. This is probably because it is very large and the population density is low.
For many research questions, you should be considering constraints.
If you see something unexpected in the data (e.g. generators bidding far below their marginal cost), you should ask yourself whether it is because of constraints.

Information about whether constraints bind each interval (or are forecast to bind) is in the data.
This data tends to be very large. Only download it if you need it.

Understanding constraints is very difficult.
e.g. what does `F_I+ML_L5_0400` mean?
The table `GENCONDATA` describes what each constraint is about.
However the descriptions are quite difficult for the uninitiated to understand.
AEMO has built [a tool](https://markets-portal-help.docs.public.aemo.com.au/Content/EMMScommon/AboutConstraints.html?TocPath=Energy%20Market%20Management%20System%20(EMMS)%7CMarket%20Info%7CAbout%20Constraints%7C_____0) to explain each constraint in plain English.
Unfortunately this is only available to market participants, not researchers.

`GENCONSET` and `GENCONSETINVOKE` contain data about when constraints are "invoked".
"Invoked" means that it is considered by NEMDE.
"Binding" means that the limit has been hit, and it is actively preventing a more economically efficient dispatch solution.
A constraint which is invoked but non-binding happened to have no effect.

If you see `Out = Nil`, that means that this constraint is invoked when there is no outage. i.e. it is invoked the majority of the time.

Constraints with names that start with a `#` are private. Only one generator is impacted, so the details are not published, or not published live.

### Green Products

"Large-scale green certificates" (LGCs) are a form of renewables subsidy for large renewable generators. 
In Europe these would be called "guarantees of origin".
Each eligible generator earns one certificate per MWh generated, which they can sell. 
Retailers and large loads have an obligation to buy a certain amount each year, which drives the price up.
AEMO's MMS data does not include LGC prices.
(Although of course the price of LGCs drives bidding behavior. If you are trying to understand wind/solar bidding, you must consider LGCs.)

"Small-scale technology certificates" (STCs) are subsidies for smaller installations (typically rooftop solar).
A wide range of subsidised and unsubsidised feed-in tariffs for rooftop solar exist, varying by region and installation age.

Unfortunately Australia does not have a carbon price.
To the best of my knowledge, we are the only country to ever _repeal_ a carbon price.
(Arguably the carbon price [cost the Gillard government the election](https://www.researchgate.net/profile/Kate-Crowley/publication/314079647_Up_and_down_with_climate_politics_2013-2016_The_repeal_of_carbon_pricing_in_Australia/links/59e5cf4baca272390ee00958/Up-and-down-with-climate-politics-2013-2016-The-repeal-of-carbon-pricing-in-Australia.pdf) in 2013.)

### Other Terms and Acronyms

`LOR` stands for "Lack of Reserve".
This is a prediction by AEMO that standard market clearing may not provide enough energy, resulting in load shedding.
In most cases the market reacts to this prediction (e.g. cancelling generator maintenance outages to generate at high prices), so the feared outcome rarely happens.
This is described more in [this Hachiko article](https://www.hachiko.energy/blog/alternative-sources-of-revenue).


## Where is the Documentation?

The official documentation for the meaning of each table, each column and their data type is [here](https://nemweb.com.au/Reports/Current/MMSDataModelReport/Electricity/Electricity%20Data%20Model%20Report.htm). The data types are Oracle SQL data types.

Sometimes the explanations in this documentation are useful. For example, the definition of `UIGF` in `DISPATCHREGIONSUM` is
"Regional aggregated Unconstrained Intermittent Generation Forecast of Semi-scheduled generation (MW)".
(Unconstrained means that AEMO is not telling wind and solar generators to turn down and 'spill' wind/sunshine.
Semi-scheduled is what most wind and solar are. AEMO tells them what to generate, but it is only an upper limit. In contrast coal and gas are scheduled. They cannot generate less or more power than they are told.)

Some documentation is not useful. For example in table `DISPATCHREGIONSUM` the column `EXCESSGENERATION` is defined as
"MW quantity of excess".
What is "excess" energy?
Is that when a solar/wind generator exceeds its UIGF forecast? 
Is it when a generators exceeds its dispatch target?
Is it the net or gross export for the region?
The writers of this schema documentation make strong assumptions about the reader's background knowledge.


When you find that documentation lacking, you can check the [Nemosis Wiki](https://github.com/UNSW-CEEM/NEMOSIS/wiki/Column-Summary) and [Watt Clarity](https://wattclarity.com.au/).

For specific terms such as "bidirectional unit", "wholesale demand response" etc, you may need to search elsewhere on [AEMO's website](https://www.aemo.com.au/) or the [glossary of the NER](https://energy-rules.aemc.gov.au/ner/720/glossary/a) to find answers. Note that AEMO sometimes restructure their website in a way which breaks bookmarks, search engine results and hyperlinks within their PDFs. Aside from that, their website often has very high-level information aimed at the general public, and some extremely niche detail, without much of a middle ground for researchers who want to understand concepts without trading in the market.

There is no machine-readable schema available (e.g. a json file containing all column names and types). I had written a crawler to scrape the metadata, but then AEMO changed the structure of this documentation page in a way that broke my crawler, and made it harder for humans to browse (by mixing tables on the same iframe so ctrl-f may find columns for the wrong table). If you are interested in a machine-readable schema, let me know.
AEMO do publish SQL scripts (privately, for market participants only) which create empty tables with the right schema in Oracle or Microsoft SQL Server. You could parse those scripts to get the schema. (I have done that in the past.) Those scripts have subtle inconsistencies which make me suspect that they are hand written. If so, it seems possible that even internally, AEMO does not have a single machine-readable schema as their source of truth.

## Where is the Data?

Most of the data is in the "MMSDM", on a public website called "Nemweb".
The root URL is `https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/`.
You can explore those folders to get a sense of the structure.
The files you want are probably the ones like these:

<https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/2025/MMSDM_2025_09/MMSDM_Historical_Data_SQLLoader/DATA/>

(Note the month and years in the URL).
The filename mostly (but not always) corresponds to the table.
e.g. [`PUBLIC_ARCHIVE#DISPATCHPRICE#FILE01#202509010000.zip`](https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/2025/MMSDM_2025_09/MMSDM_Historical_Data_SQLLoader/DATA/PUBLIC_ARCHIVE%23DISPATCHPRICE%23FILE01%23202509010000.zip) contains data for the `DISPATCHPRICE` table.
The large tables may be split into multiple files per month.

The other folders contain scripts and the same data in other forms used to load the data into an Oracle SQL database. 
This is what AEMO expects market participants to do. However it is incredibly complex and error-prone. For example some scripts make assumptions about column order, but the data files do not necessarily have a consistent column order across months. The schema itself has changed over the years, and the historical scripts do not necessarily cope with that well. From personal experience, my advice is to not touch that stuff unless you already have extensive experience with [PDR Loader](#pdr-batcher-and-pdr-loader) and already have an Oracle SQL database.

The `P5MIN_*` tables are in both `DATA/` and [`P5MIN_ALL_DATA/`](https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/2025/MMSDM_2025_09/MMSDM_Historical_Data_SQLLoader/P5MIN_ALL_DATA/). As far as I can tell, the files are identical, other than the first row (which is metadata) and the filename.
Most `PREDISPATCH*` tables are extremely large. (`PREDISPATCHPRICE` is not particularly large though.) 
The data for these tables in `DATA/` is just a subset of the full table.
The full dataset for those tables is in [`PREDISP_ALL_DATA`](https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/2025/MMSDM_2025_09/MMSDM_Historical_Data_SQLLoader/PREDISP_ALL_DATA/).
Further down there is [an example](#price-predictions) of finding and using `PREDISPATCH` and `P5` data.

The [NEMDE](https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/NEMDE/) folder contains the detailed inner workings of the linear optimiser used by AEMO to decide how much each generator should produce. This is useful if you want to query "price setter" data to understand who set the price. Note that you should be cautious when drawing conclusions from that data. See the guide from [Watt Clarity](https://wattclarity.com.au/articles/2019/02/a-preliminary-intermediate-guide-to-how-prices-are-set-in-the-nem/).

The live (5 minutes old) data is available in [/Reports/CURRENT](https://www.nemweb.com.au/REPORTS/CURRENT/). The file formats are more complicated because they are several CSV files with different columns concatenated into one file. You probably do not need that unless you are actively operating in the market. 

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
If you have not heard of Polars, it is like the new Pandas.
It is about 30 times faster, and I find the syntax easier to read and write.
(No more dreaded errors about "A value is trying to be set on a copy of a slice from a DataFrame", nor clunky `df[df[col]]`, `df.loc['col', df['col'] == df['col']]`.)
For this, you can use the `cache_compiler` to just save the data as Parquet with Nemosis, then query those files on disk with Polars. (Use the same approach for DuckDB, Arrow, R etc.)
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
If you are processing multiple tables (e.g. `P5MIN_REGIONSOLUTION` and `DISPATCHPRICE`) you need this string to tell Polars which files to read and which to ignore.

Nemosis currently saves datetimes as strings in the Parquet file. If using `cache_compiler`, you need to parse them into datetimes yourself. Since this happens for every table, I factored that into a simple function with `.pipe(parse_datetimes)`.

Sometimes Nemosis excludes columns from the data. (It includes only the most important columns, as an optimisation.)
If this happens (e.g. 1 second FCAS data), you can fix that with [this workaround](https://github.com/UNSW-CEEM/NEMOSIS/blob/master/README.md#accessing-additional-table-columns).

Nemosis has some limitations.
I am working with the maintainer to make [some improvements](https://github.com/UNSW-CEEM/NEMOSIS/issues?q=author%3Amdavis-xyz).
In particular, it loads each file into memory as a Pandas dataframe (even when using `cache_compiler`). This means that you cannot process the very large files (e.g. bid data) on a normal laptop. 

If Nemosis works for you, skip the next sections and jump to [How to Query and Understand the Data](#how-to-query-and-understand-the-data).
If not, the next few sections describe the details of how to download and parse AEMO's data files yourself.

### PDR Batcher and PDR Loader

AEMO created this dataset and the Data Interchange for market participants (generators, retailers etc) in the 1990s, prior to REST APIs, TLS, parquet files, distributed systems, clouds etc. They expect that anyone who wants to read the data will download a pair of applications called "PDR Batcher" and "PDR Loader". ("PDR" stands for Participant Data Replicator.) Batcher downloads the files over FTP, inside a private VPN, then Loader loads them one row at a time into an Oracle SQL Database. The documentation is [here](https://di-help.docs.public.aemo.com.au/Content/Index.htm?tocpath=_____1).

There are several challenges with this approach.
The first is that AEMO removed this application from their website.
They took it down when the [log4j vulnerability](https://en.wikipedia.org/wiki/Log4Shell) become public, because this software was affected. Then when they released a patched version months later, they did so only through the private FTP server.
So if you are not a participant (e.g. you are an academic researcher), you will probably not be able to even obtain the binary.

Even if you have a copy, it is extremely difficult to get working unless you know someone with experience. If you are a researcher, you do not have the time to spend weeks learning how this bespoke system works, and debugging it when it does not.  The system is designed as a thick client, instead of a clear abstract API. There are many obscure mapping tables and configuration options. (e.g. How do you tell PDR Batcher which tables should be append-only, and which ones should overwrite existing rows based on certain partition columns?) The latest release did add a lot of great functionality (e.g. natively connecting to cloud storage such as S3), but my view is that if you are just a researcher (and even for some market participants) it is not worth using. e.g. I know people who tried to backfill a fresh database with all publicly available data. They ran into many issues. They asked AEMO for help, and were told that there is no simple, generalised way to backfill all the public data.

PDR Loader operates one row at a time. If you want to backfill all bid or price prediction data for the last decade, that takes weeks, even if you use large, expensive servers. This was probably because the system is optimised for operational use cases, where generators insert a few rows at a time into a row-based database, and query mostly the last few rows in each table. However if you are a researcher doing analytic queries about historical data, you will probably do infrequent, batched insertions, and your queries will scan most of the rows in a table. So a column-based approach (e.g. parquet files) is probably [more suitable](https://r4ds.hadley.nz/arrow#advantages-of-parquet). Running an Oracle or Microsoft SQL Server database with 1 TB of data in the cloud is expensive. On-premise options have their challenges too. (e.g. will your laptop have enough memory even if you run the queries you want on a SQL server installed locally, connected to a slow external hard drive?) Using a more modern, column-based approach (e.g. parquet files locally or even in the cloud) will be far cheaper and gives faster query results.

The main benefit of PDR Loader over a DIY approach is that it will figure out which tables are append-only, and which are update-insert.
(Or rather, you need to somehow find the configuration file that tells PDR Loader how to do this.)
That is, AEMO publishes new data all the time. Sometimes the new rows should be added above/below the old rows. 
Sometimes the old rows should be updated.
It depends on the table. (Remember, there are hundreds of tables.)
If you use a DIY approach (including Nemosis), you may need to deduplicate the data when you query it. 
This is described later in [Deduplication](#deduplication).

If you do want to know more about how to run PDR Batcher and Loader, and the pros and cons, check out [Hachiko's guide](https://www.hachiko.energy/blog/dockerising-aemo-pdr). As they put it: "It’s not broken. However it’s also not easy."

### Connectivity

As mentioned earlier, AEMO expects market participants to download these files and private files over FTP inside a private VPN.
I think the public website is intended for researchers, which is fantastic. 
(AEMO if you are reading this, thank you so much!) 
Although I have never seen AEMO state this goal, or enumerate conditions of use. Please do not hammer their website (e.g. downloading data you do not need, or doing an unreasonable number of parallel downloads). I live in fear that one day they will simply turn off Nemweb.

Nemweb is hosted in AWS's Sydney region (`ap-southeast-2`). So if you are connecting from the cloud, choose something in Sydney. (For example, I am living in France at the moment. Downloading the data to my laptop is slow. If I spin up a server in Sydney the download is far faster, and then I connect to that server with Jupyter over SSH.)

Nemweb has both an HTTP and HTTPS interface. Note that if you are crawling the HTML file pages, sometimes the encrypted HTTPS pages contain links to unencrypted HTTP pages. I think they have fixed this now. However I am mentioning it because if you are doing this in a network environment where outbound HTTP (port 80) is blocked and HTTPS (port 443) is allowed, then you will get unexpected timeouts which cannot be resolved through retries.


### File Formats

#### Quick File Format Explanation For Monthly MMSDM Data

One benefit of Nemosis is that it handles unzipping and dropping metadata rows and columns for you. 
This section contains details of how to do this yourself.

For the [monthly MMSDM data](https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/2025/MMSDM_2025_09/MMSDM_Historical_Data_SQLLoader/DATA/) that this post focuses on, the files are zips of CSVs, with one CSV per zip file.
(Pandas can do the unzipping for us. Polars cannot do this [yet](https://github.com/pola-rs/polars/issues/19447).)

A CSV file might look like:

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
Skipping the footer can be harder. Few libraries have a `skip_footer` option. With some libraries you may need to read the file as text first to count the rows, then tell it to only read the first N - 1 rows. Alternatively you can tell it that the "comment" character is `C`, but only if that comment option only applies from the start of the line. I tend to parse these with Polars, in which case you can tell it that the comment _prefix_ is `C,"END OF REPORT",`.

After stripping the header and footer, you will also need to drop the first 4 columns. These are metadata columns. (e.g. in this example, `DISPATCH` and `PRICE` tell you that this data is for the `DISPATCHPRICE` table. However most such mappings are less obvious. You should figure out which file goes where from the filename if you can.) The names of these metadata columns vary between tables. Note that there may be overlapping column names. Some tables have a name for the 2nd or 3rd column (which is metadata) which is the same as the name of another column later on (which is data). Some libraries struggle to cope with this.

Here is an example of how to read these files with Pandas.
This is the same approach which Nemosis uses under the hood.
For the footer, it is parsed as an incomplete data row, with mostly `NaN`s, and then that last row dropped _after_ reading.
Since the footer is 3 columns, and we drop the first 4 columns anyway because they are metadata columns, this works.


```
import pandas as pd

df = pd.read_csv(
    'SOMEFILE.ZIP',  # pandas can unzip if there is only one CSV inside
    header=1, # skip first metadata row
).iloc[:-1, 4:] # drop 4 metadata columns and footer
```

A safer way is to use `skipfooter=1`, but this is far slower because it requires `engine='python'`.

```
df = pd.read_csv(
    'SOMEFILE.ZIP', # pandas can unzip if there is only one CSV inside
    header=1, # skip first metadata row
    skipfooter=1, # skip footer
    engine='python', # far slower, but required for skipfooter
).iloc[:, 4:] # drop metadata columns
```

You could also read the whole file once (with Pandas or something else) to count the rows, then exclude the footer with `nrows`.

If you prefer Polars to Pandas:

```
import polars as pl
import polars.selectors as cs

lf = (
    pl.scan_csv(
        'SOMEFILE.CSV', # must be unzipped beforehand
        skip_rows=1, # skip the header
        comment_prefix='C,"END OF REPORT",' # skip the footer
    )
    .select(~cs.by_index(range(4))) # drop metadata columns
)
```

In base R we can use `read.csv` with the same trick as for Pandas (reading the footer row as data, and then dropping it).

```
df <- read.csv(
  "/tmp/example.CSV",
  skip=1, # skip header metadata
  header=TRUE, # next row has column names
)[df[[1]] != "C", -c(1:4)] # drop footer and metadata columns
```

To use `read_csv` from Tidyverse in R:

```
library(tidyverse)

read_csv("example.CSV", skip=1) |> 
  filter(I != "C") |> # filter out metadata footer
  select(-c(1:4)) # drop metadata columns
```

Note that in all of these examples the column schema is inferred from the data by the library you use, based on the first thousand rows or so.
For large data this might not work.
In some AEMO CSVs a particular column may have only integers for the first million rows, and then in row 1,000,001 the number has a decimal component so cannot be parsed as an integer.
Many libraries (e.g. Pandas, Polars) will throw an error when they encounter this row, _after_ spending a long time parsing all the prior rows.
An easy, but slow way to resolve this is to tell your library to scan the entire file to infer data types.
Otherwise you will need to hard-code the schema for that particular column or all columns.

#### File Format Details And Other Data Files

For other AEMO data (e.g. the [daily data](https://www.nemweb.com.au/REPORTS/ARCHIVE/)) the files are zips of many zips of many CSVs. (I have never seen AEMO publish zips  of zips of zips. If you are programmatically  unzipping nested zips, watch out for [zip bombs](https://en.wikipedia.org/wiki/Zip_bomb).)

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
Some libraries will refuse to read this CSV at all.
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

* `C` means this is a 'control' row. Typically just the header or footer, although I have seen multiline headers in some obscure files. You should probably ignore all such lines.
* `I` means this is an 'information' row. These rows contain the column headers of a new table.
* `D` means this is a 'data' row. These rows contain the actual data, corresponding to column names given by the most recent `I` row.

Again it is worth pointing out that mapping `DISPATCH` and `REGIONSUM` to `DISPATCHREGIONSUM` sounds straightforward, but it is often not. Sometimes it would be something like `DISPATCH_REGIONSUM`, sometimes it is something completely different (especially for bids).

The 4th column is an integer. It is somehow related to the versioning of the schemas of each table. I do not understand it exactly, and have only seen one situation in all my years of working with this data where it mattered.

The final row is used as a checksum. The integer is the number of rows in the overall file (including the header and footer). I am unsure how rows with escaped newlines are counted. I normally just ignore this. The only time I have seen a checksum mismatch was with data in this format from someone other than AEMO, who calculated the checksum excluding the footer. This checksum was put in because this system was designed back in the 1990s, when formats such as FTP could result in partial files being written to disk, and file processing commencing prior to the download finishing. With modern protocols such as HTTP over TCP, and especially with object storage such as AWS S3, getting only half a file is very unlikely. Even more so if you are splitting up your analysis script to first download all the files you want, then parse them, in the same process.

### File Names

Many files have a `#` in the name. Note that if you are using a terminal (e.g. Bash on Linux), this will be treated as a comment. So instead of `cat my#file.CSV` do `cat "my#file.CSV"`, otherwise you will get "File my not found".
AEMO uses uppercase for file extensions. (`.CSV` and `.ZIP`, not `.csv`, `.zip`.)



### Reusing the HTTP Connection

f you are downloading files with Requests in Python you may write something like this:

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

Reusing the HTTP connection speeds up the download and reduces AEMO's server load (so they are less likely to take down the data one day).
(You should to this for other webscraping and APIs too.)
I explained this in more detail [here](../requests-session).

### Retries

Nemweb's servers can be slow and unreliable. Try to add sleeps between requests, and have aggressive [retries with delays and backoff](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/).
(You do not want to leave a script running overnight to download data, only to find that it gave up after 5 minutes because of a timeout.)

If you are using a `requests.Session`, this is simple:

```
from urllib3.util.retry import Retry
import requests

session = requests.session()

retries = Retry(
    total=4,
    backoff_factor=2,
    status_forcelist=[403, 429, 500, 502, 503, 504], 
    allowed_methods=["HEAD", "GET", "OPTIONS"]
)
adapter = requests.adapters.HTTPAdapter(max_retries=retries)
for protocol in ['http://', 'https://']:
    session.mount(protocol, adapter)
```

Note that including `403` in a retry configuration is unusual.
I added this because Nemweb often returns this as a throttling signal.
So sleeping and retrying is the correct response.


## How to Preprocess the Data?

### Parsing Timestamps

Most timestamps are in the format `%Y/%m/%D %H:%M:%S`, e.g. "2025/11/10 19:30:00".
AEMO data never contains just a date. Where something is logically a date not a datetime, it will appear as a datetime at midnight at the start of that day.

### Special characters

`DUID` is the identifier for a generator. 
Some DUIDs contain funny characters, such as `W/HOE#2` for Wivenhoe Power Station. 
This slash and hash can cause errors with misleading error messages. (e.g. if you are saving files to disk with hive partitioning on the `DUID` key, you may accidentally create an additional nested folder called `HOE#2` within parent folder `W`.)

There are a few obscure tables which contain newline characters within the cell values. These are escaped with double quotes around the whole value.
These are in tables which researchers do not normally look at, such as the Market Suspension Notices in `MARKETNOTICEDATA`.
Most CSV parsing libraries can handle this. I am mentioning this just in case you are trying to read the data with something simple like:

```
with open('data.CSV', 'r') as f:
    headers = f.readline().strip().split(',')
    for data_row in f:
        cells = data_row.strip().split(',')
```

If you do that, it will work for the vast majority of tables, but not `MARKETNOTICEDATA`.

Constraint identifiers have many funny characters (e.g. `#`, `>`)


### Running Out of Memory With Polars

Sometimes when you query data with Polars you may run out of memory, even when the query seems small.
To prevent this:

- Pass `low_memory=True` to `scan_parquet()`
- Even if the resulting dataframe is small enough to just call `.collect()`, stream to a Parquet file on disk, then read it back. For some reason this may use far less memory. This is particularly useful for intermediate queries where you just use `.head()` instead of an aggregation. (Polars is still a new library. They made some changes to their streaming engine since I discovered this trick.) 
- Add _swap_. (On Linux you can even create a file in a normal folder and register it as swap memory.)

::: {.callout .warning}
Vertical scaling (switching to a larger computer) might not prevent you from running out of memory.

Polars uses all CPU cores by default. If the bigger computer has more cores, each core consumes memory, so the total memory usage will go up and you may still run out of memory.

You can tell Polars to use fewer cores with the [`POLARS_MAX_THREADS`](https://docs.pola.rs/api/python/stable/reference/api/polars.thread_pool_size.html) environment variable. 
:::



## How to Query and Understand the Data

### Units

If no units are specified in the schema documentation or the column name itself,
power is usually megawatts (`MW`), and energy is megawatt hours (`MWh`).

### Deduplication

The MMS dataset has hundreds of tables.
Some of them are append-only (e.g. `DISPATCHPRICE`).
For some reference data the same dataset is republished every month, so that you can still have a usable dataset if you only download the latest month of zip files.
For some data, some or all rows change regularly, in a way where they should _overwrite_ previous rows.
This is only a minority of tables. (AEMO normally errs on the side of providing higher-dimension data with version history).
So you should deduplicate to grab the latest row for each entity.  (e.g. sort by column `LASTCHANGED` then take the first row for each group of primary keys.)

One of the main benefits of [PDR Loader](https://nemweb.com.au/Reports/Current/MMSDataModelReport/Electricity/Electricity%20Data%20Model%20Report.htm) is that it will do this insert/update for you.
If you are doing something else (e.g. [Nemosis](https://github.com/UNSW-CEEM/NEMOSIS/)) then I recommend doing some exploratory queries to check whether the unique primary keys are indeed unique.

The [schema documentation](https://nemweb.com.au/Reports/Current/MMSDataModelReport/Electricity/Electricity%20Data%20Model%20Report.htm) lists "Primary Key Columns" and "Index Columns" for each table. Using Pandas/Polars/SQL you can deduplicate based on those. (Typically you should choose the one with the latest `LASTCHANGED` value.)

I have seen one particular month where the CSVs for some tables overlapped with the prior month by one interval.

If you have unexpected duplicates, check for an [`INTERVENTION` column](#intervention).

### Missing Data

If you find a table in the schema documentation for which you cannot find the data (or it appears empty),
it may be only published privately. (e.g. each generator sees the data for themselves. The public files are empty.)
Sometimes the public/private classification applies in a row-wise way.
(e.g. some [constraint](#constraints) data is private.)

To find out if a table is public, check the [documentation](https://nemweb.com.au/Reports/Current/MMSDataModelReport/Electricity/Electricity%20Data%20Model%20Report.htm) for that table. You can also check [the list of monthly MMSDM files](https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/2025/MMSDM_2025_09/MMSDM_Historical_Data_SQLLoader/DATA/).

Sometimes columns are always empty. This could be because they have been deprecated, or maybe they will be populated in the future. Sometimes you just need to look at the actual data to find out if it is empty.

Sometimes data is just missing for one table for one month. (It may be present for the prior and subsequent month.)
Different tables only go back historically to different starting points.
This may be because that is when the relevant rules or schema changed.

If you cannot find data for a particular generator, that may be because it is [non-scheduled](#scheduled-vs-non-scheduled).

### Understanding Timestamps

::: {.callout .tip}
Timestamps generally refer to the _end_ of the period, not the start.
:::

e.g. a `SETTLEMENTDATE` of "2025/01/02 03:05:00" refers to the period from 3:00 to 3:05.

Pay attention to the documented definition of each field.
For some power values it is the average across the 5 minute period.
For most power values it is an instantaneous power value at the end or start of the period.

`INITIALMW` refers to the power at the start of the period. `TOTALCLEARED` refers to the power at the end of the interval. 
"Cleared" refers to what AEMO instructs or predicts. AEMO's plan is that generators will take the entire period to adjust their output, linearly.
This is described in more detail in [my thesis](../diagonal-dispatch).

Some fields are logically dates not datetimes. However they will still appear in the data as datetimes,
at midnight at the _start_ of the day.

### Timezones

::: {.callout .tip}
All timestamps are in "market time", i.e. `Australia/Brisbane`, `UTC+10`, with no daylight savings.
:::

This is true even for data which applies to regions in other time zones.

(Note that if Queensland ever adopts daylight savings, it is likely that a lot of IT systems in the electricity sector will break in a Y2K kind of way, because many people configure the timezone as `Australia/Brisbane` when it is _technically_ supposed to be `UTC+10`.)

### 5 vs 30 minutes

The NEM operates on a 5 minute schedule.
This was not always the case.
Prior to October 1st 2021 there was a mix of 5 and 30 minutes.
Bids were submitted with 5 minute granularity, and were evaluated every 5 minutes, to produce a "dispatch price" every 5 minutes, and tell generators what power level to generate at every 5 minutes. However generators were _paid_ based on the half-hour average of 6 5-minute prices, called the "trading price". (This was a historical design choice, from when computers were less powerful.) This led to some perverse distortions, where after a ceiling price event (e.g. + 15,000 $/MWh), every generator would bid to the floor (- 1,000 $/MWh) for the remainder of the half hour, because the _average_ would still be very high.
So if you are querying data from prior to October 1st 2021, check each table to see whether the frequency of rows changes to half-hourly back then.

Even today, some tables still have a half-hour granularity. (e.g. some price forecasts, and rooftop solar power). So always check the data before writing your queries.

### Region ID

Regions are the geographical states of the NEM.

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

::: {.callout .warning}
Watch out: `DUID`s (generator identifiers) may contain [funny characters](#special-characters) such as `/` and `#`, which might need to be escaped
:::

For some data you have different granularities.

- "Participant" is the highest level entity. This is a legal corporation, which may own several generators and retailers. Although note that a single company like AGL may actually have many `PARTICIPANTID`s (`AGLPARFQ`, `AGLSHYDR`, `AGLE` etc), probably reflecting different holding companies/special purpose vehicles.
- "Station" is a generator, in the common-sense understanding. e.g. there would be one wikipedia page per station.
- `DUID` is a dispatchable unit. Most market data is at this level.
- "Genset" (`GENSETID`) is a part of a dispatchable unit.

For example, the Coopers Gap Wind Farm has `STATIONID = COOPGWF`, containing one `DUID` (`COOPGWF1`). This contains two `GENSETID`s (`COOPGWF1` and `COOPGWF2`). Until 2024, the `PARTICIPANTID` was `AGLPARFQ`, i.e. AGL. Then it changed to `COOPGWF`. (This is a good example of how seemingly static reference data can change over time.)

Relevant tables for joining these together are `DUDETAILSUMMARY`, `DUDETAIL`, `DUALLOC`, `STATION`, `STATIONOWNER`.
Most stations have only one `DUID`. Most `DUID`s have only one Genset.

- `DUDETAILSUMMARY` maps `DUID` to `STATIONID` and `REGIONID` (many `DUID`s to each `STATIONID`, and many `DUID`s to each `REGIONID`). This contains a lot of other useful data (e.g. loss factors), so should be the first place you look to join these things.
- `DUALLOC` maps `DUID` to `GENSETID` (many to one). 
- `STATION` maps `DUID` to `STATIONID` (many to one), although `DUDETAILSUMMARY` does the same.
- `PARTICIPANTID` maps each `STATIONID` to a `PARTICIPANTID` (many to one), although you can get this information from `DUDETAILSUMMARY`.

Note that these tables for joining IDs have a version history, so you should deduplicate to the latest record (sort by `EFFECTIVEDATE` descending then `LASTCHANGED` descending then take the first row in each group, or join with the timestamp).

### Intervention

AEMO takes all generators' bids, transmission line constraints, demand forecasts etc, and they plug it into a big linear optimiser called the NEM Dispatch Engine (NEMDE), which finds the economically optimal solution. (e.g. Maybe the grid cannot get power from the cheapest generator to the consumer, so a more expensive generator elsewhere is used instead.) Sometimes the complexity of the electrical grid cannot be represented nicely in mathematics. In those cases AEMO manually intervenes to tweak the results. This is called "Intervention". 
The data often contains both the pure-math result, and the actual result.
Interventions are rare, but the values in `INTERVENTION==1` rows may be drastically different to the `INTERVENTION==0` rows.

::: {.callout .tip}
If a table contains an `INTERVENTION` column, you should keep only rows with `INTERVENTION == 0`.
:::

The only exception I can think of is if your research question is about interventions.

There is a slightly different adjustment called "Direction", which is harder to see in the data.
If you find 'out of merit' dispatch happening, Directions and Interventions are one reason why.
e.g. A huge amount of gas generation in South Australia happens when the price is below the gas generators' bid/cost, because there is a requirement to always have a minimum amount of gas generation running. (As an aside, this metric is crudely defined, and this limit drastically limits the decarbonisation impact of additional solar and wind, yet was notably absent from the recent political discussions about nuclear power.)

### RRP

::: {.callout .tip}
`RRP` is the energy price. 
::: 


It does _not_ stand for "Recommended Retail Price". It stands for "Regional Reference Price".

`ROP` is the "Regional Override Price".
This is a counterfactual price which was not used because some adjustment was made.

Within a region (e.g. within NSW), transmission constraints may hinder the ability to transmit power from one generator to a load in the same region.
"Local prices" incorporate transmission constraints to provide the theoretical marginal cost of increasing power at each node in the network.
However (for now) generators are not paid this price. This price is useful only to understand why generators may be constrained on (forced to generate even when paid less than their bid) or constrained off (forced to not generate even though their bid is lower than what they will be paid).
The controversial "COGATI" proposal is to transform the NEM into a nodal network, such that generators are paid the local price, not regional price. That interesting debate is outside of the scope of this article. Just note that this has not come into effect at the time of writing (late 2025), and is unlikely to be implemented within the next few years.

You can find an explanation of price setting in [Watt Clarity](https://wattclarity.com.au/articles/2019/02/a-preliminary-intermediate-guide-to-how-prices-are-set-in-the-nem/).

### Import/Export


Interconnectors are the transmission links between the regions.
Sometimes they are the kind of transmission line you would expect, with a few thick wires strung between a line of towers.
Sometimes they are more of an abstraction over several smaller lines, as a ["hub and spoke" simplification](https://wattclarity.com.au/articles/2019/03/price-setting-concepts-an-explainer/).

Interconnectors are bidirectional. 
The convention for the sign and direction is:

::: {.callout .tip}
Positive export values mean that power is flowing **away from Tasmania**.
:::

- TAS1 to VIC1
- VIC1 to SA1
- VIC1 to NSW1
- NSW1 to QLD1

Negative values mean power flows in the opposite direction.


### Losses

You may see terms such as "marginal loss factor" (MLF), "transmission loss factor" (TLF) or "distribution loss factor" (DLF).

Even within one region, power generated by one generator will be partially lost in transmission before reaching the consumer.
MLF and TLF account for this.
The real grid topology is very complex, so AEMO models the grid as a "hub and spoke" model, where all loads and generators are directly connected with individual, lossy lines to an imaginary central reference node within each region. 

Loss factors are typically slightly smaller than 1. Sometimes they are exactly 1 (e.g. a generator connected directly to the transmission network instead of a distribution network will have a DLF of 1.) In rare cases they may be slightly above 1 (e.g. when a generator in a load center alleviates constraints).

AEMO has already applied these loss factors to most data, which appears as if the generator were at the regional reference node.
So you can generally ignore it.
One case where you would care is if you want to know how much energy a generator provided including energy lost in transmission, as opposed to knowing how much _usable_ energy there is. You would have to divide the power values in tables such as `DISPATCHUNITSCADA` by a loss factor in `DUDETAILS`.
Another context is when dealing with private settlement data (e.g. `SETGENDATA`).
This is described in more detail in [Watt Clarity](https://wattclarity.com.au/articles/2019/03/price-setting-concepts-an-explainer/).

### TRK Tables

There are many table names ending in `TRK`.
These contain metadata about version history. 
(e.g. `STATIONOWNERTRK` contains version history metadata for `STATIONOWNER`.)
You probably do not need to look at them.

### Bids

Bidding data is quite difficult to query, mostly because it is a tremendously large volume. (Terabytes, when in uncompressed CSVs.)
So if you are planning on using some simple Pandas code, think again.
You probably need something more advanced.
(Polars on a laptop _might_ be sufficient, if you are careful with memory management. I listed some tips [earlier](#running-out-of-memory-with-polars).)
I might write another blog post focusing on bidding data.
Let me know if you are interested.
For now, here are some preliminary notes.

I already described some of the timing and structure of bids in [an earlier section](#predispatch-is-not-a-day-ahead-market).

The relevant tables are `BIDDAYOFFER`, `BIDOFFERPERIOD`, `BIDPEROFFER_D`, `BIDDAYOFFER_D`, `BIDPEROFFER`.

- All bids are published, publicly, but with a delay or one or two days.
- Since bidding data is large, it is often split into many files on Nemweb. This splitting process varies across time. So you must enumerate the file list from the parent URL before downloading them. (Thankfully the HTML on that file list web page is very parse-able and stable.)
- If a generator wants to rebid one interval, they must re-submit a file for every interval of the day (including intervals in the past). This ends up in the data. So there is a huge amount of duplicated data. AEMO have started publishing only the rows which change. They have done this since I last worked with bidding data closely, so I do not know the details. I _suspect_ that the tables or files with names ending in `_D` are the deduplicated ones. (Perhaps the distinction only exists in the files on Nemweb, and not in the schema documentation.)
- For every rebid, _one_ row (per rebid, per generator) appears in `BIDDAYOFFER` (with timestamps, rebid reason, rebid category and price bands), and then many rows (one per interval of the trading day) appears in `BIDOFFERPERIOD` (with ten columns containing the bid volumes for each band). `BIDOFFERPERIOD` is the extraordinarily large table.
- Since [5 minute settlements](#vs-30-minutes) were introduced, the bid metadata has expanded to many more timestamps. 
- AEMO allows generators to submit bids which do not comply with the timestamp specification. So every millionth row may cause an error when you are using `strptime`. 
- Similarly, AEMO does not validate/coerce the rebid reason. I have seen a few bids out of billions of rows which use a lowercase `f`, instead of the standard `F`. So if you are trying to use an enum to optimise your code, you will get an error when processing such rows. So coerce this string into uppercase before casting it to an enum.
- Some of the bidding data contains millisecond granularity, so the datetime string format is different to other datetimes in the MMS dataset. - Some bidding fields contain a time without a date. Sometimes it is ambiguous which date it is, so you must guess with heuristics. This was an oversight (by the AER not AEMO, as far as I am aware).
- The CSVs from AEMO are compressed. If you convert to Parquet, that is also compressed. Compression works well for things like timestamps and DUIDs, which repeat or overlap a lot. However for rebid reasons, these are long strings which may vary a lot. Therefore I suggest that unless you know you will need them, you should drop the `REBIDEXPLANATION` when converting from CSV. You should still keep the `REBID_CATEGORY`, which is a single character. This is good enough for most purposes. The human-readable explanation sentence is hard to do any automated analysis on.
- Bidding data includes FCAS. If you do not care about FCAS for your analysis, you should filter to only include `BIDTYPE = ENERGY`. If doing this when converting from CSV to Parquet, you will save a lot of space.

::: {.callout .warning}
Sometimes the filenames for bidding data files on Nemweb are for a different bidding table to the contents of that file.

Check the column names against the schema documentation to confirm which table it is.
:::


If you want just the price bands for a given day, find the row in table `BIDDAYOFFER` with the largest `OFFERDATE`, for a given tuple of `DUID`, `BIDTYPE`, `DIRECTION`, `DUID`, `SETTLEMENTDATE`.

If you want to look at the actual bid volumes, use `BIDOFFERPERIOD`.
`TRADINGDATE` is a date (even if it looks like a datetime), referring to the _trading_ day, which goes from 4:00-4:05 am to 3:55-4:00 am the next calendar day. So this does not align to calendar days.
You should construct a datetime at 4am on that date, then add 5 minutes multiplied by `PERIODID`.
Then you must delete rows in the past (`OFFERDATETIME >= INTERVAL_START`).
Then to deduplicate, find the row with the largest `OFFERDATETIME` for  each `DUID`, `BIDTYPE`, `INTERVAL_START`. Note that this last step requires a _lot_ of memory, even if you deduplicate each month individually. (I err on the side of caution by deduplicating on a per-month basis, not per file, if there are many files per month.)
Then join each row with `BIDDAYOFFER` to get the 10 price bands that each of the 10 volumes corresponds to.

## Common Queries

### Average Price

Here is an example of how to find the unweighted average price in each region, using Nemosis and Pandas.
The energy prices are available in table `DISPATCHPRICE`.

<!-- These links to code are reformatted at runtime with JavaScript 
     to insert the code block inline -->
::: {.code-snippet}
[`avg-price.py`](./examples/avg-price.py)
:::

This yields:

```
INFO: Compiling data for table DISPATCHPRICE
INFO: Returning DISPATCHPRICE.
REGIONID
NSW1     96.937920
QLD1     82.126428
SA1     164.951991
TAS1    117.847834
VIC1     82.122759
Name: RRP, dtype: float64
```

I recommend explicitly checking that the dataframe starts and ends when you expect.
It is easy to get an off-by-one error.

### Revenue Skewness

Here is an example of how outliers drive generator revenue.
The objective of this query is to find the numbers for the following claim:
"Half of all generators' energy revenue each year comes from only x% of trading intervals."
(Here I am excluding FCAS revenue.)

We can get energy prices from `DISPATCHPRICE`, and energy per generator per interval from `DISPATCH_UNIT_SCADA`.
(`DISPATCHLOAD` also contains energy measurements per generator per interval. However it contains a lot more data too, so the files are far bigger.)
The docs for `DISPATCH_UNIT_SCADA`  say `SCADAVALUE` is the "Instantaneous MW reading from SCADA at the start of the Dispatch interval".
I will use linear interpolation to join the dots.
For most cases this is good enough.
In practice the power level of generators does meander from this diagonal line.
(e.g. data lags mean that generators may have a constant output for the first 30 seconds or so, then ramp to their next level.)
If you want more exact data, you can use the 4 Second SCADA data. That is very large though.

For this example I will download the data with Nemosis, and then query it with Polars.

I sink the result to a Parquet file, then read them back.
This may seem unnecessary, but this is [a trick to reduce memory consumption](#running-out-of-memory-with-polars). (This query uses a lot of memory for a normal sized laptop.)
Similarly, I did not really _have_ to parse the timestamps. Doing so reduces the memory footprint of the join.

::: {.code-snippet}
[`price-skew.py`](./examples/price-skew.py)
:::

TODO: re-run and paste new results

This yields:


| `REGIONID` | `FRAC_TIME` |
|------------|-------------|
| `SA1`      | 0.05997     |
| `NSW1`     | 0.085669    |
| `QLD1`     | 0.108968    |
| `VIC1`     | 0.113849    |
| `TAS1`     | 0.131157    |



i.e. In 2024, generators in South Australia earned half of their revenue during the best 6% of the time.

### Rooftop Solar

Unlike most generation, rooftop solar is not directly measured. (This is true even in Victoria, where smart meters are mandatory.)
Instead AEMO estimates how much power is, was or will be generated by rooftop solar.
Typically AEMO (and most other grid operators too) treat solar power as negative consumption, due to the unique data provenance.
This leads to funny things like "negative" demand.

::: {.callout .tip}
For most analysis, I recommend doing the work to get rooftop solar data, and adding it to large-scale generation.
:::


Suppose you want to analyse some data from Australia's national electricity market, to see our current fuel mix. To figure out the fuel mix, you take the per-generator power `DISPATCH_UNIT_SCADA` (or `DISPATCHLOAD`), and join that to a list of generators with fuel type and region (e.g. the [participant registration list](https://github.com/UNSW-CEEM/NEMOSIS/wiki/AEMO-Tables#generators-and-scheduled-loads-generators-and-scheduled-loads)). Then you can do a simple group by and sum up the energy. You will find that 8.4% of South Australia's generation in 2024 was from solar.
However this is actually not correct. 
Once you add rooftop solar, you see that actually 28.4% of South Australia's generation in 2024 was from solar. 
Without including rooftop solar, you would be wrong by a factor of 3. 
For more information, see [my post on LinkedIn](https://www.linkedin.com/posts/mdavis-xyz_ive-been-thinking-a-lot-recently-about-how-activity-7293600958717054976-k6O9).

<!-- LinkedIn blocks iframe embeds with CORS -->
<!-- <iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:7293600955600678913?collapsed=1" height="670" width="504" frameborder="0" allowfullscreen="" title="Embedded post">
    <a href="https://www.linkedin.com/posts/mdavis-xyz_ive-been-thinking-a-lot-recently-about-how-activity-7293600958717054976-k6O9?utm_source=share&utm_medium=member_desktop&rcm=ACoAAByP1T4BC3Cgz448qtc97FMGsQ5F73YK4Tg" target="_blank" >
        LinkedIn Post
    </a>
</iframe> -->


Rooftop solar data takes a bit of work to get.
It is 30 minute granularity, so do not forget to upsample it.
If you append it to large-scale generation data without upsampling, you will have 0 for 5 out of every 6 intervals.

You should filter out `REGIONID`s which do not end in `1`, as described [earlier](#region-id).

There are also overlapping rows because data comes from several different estimation methods. In the `TYPE` column the possible values are `DAILY`, `MEASUREMENT`, `SATELLITE`. `SATELLITE` is the most accurate, so take that if it is available. `MEASUREMENT` is the next most accurate. Luckily this is reverse alphabetical order.
`QI` is a quality indicator.
I am unsure, but I think you should take the best `TYPE`, and then break ties by taking the highest `QI`.

As an example, here is how to get deduplicated 5-minute rooftop solar data with Polars:

::: {.code-snippet}
[`rooftop-pv.py`](./examples/rooftop-pv.py)
:::

Unfortunately upsampling from 30 minutes to 5 minutes generally requires that you have all the data in memory.
For Polars this means you cannot stream, so I call `.collect()` first. This particular table is small enough that this is generally not a problem.
If it is a problem, or just too fiddly, a workaround is to duplicate the data 6 times, adding 5 × N minutes to each timestamp, then concatenating them vertically. (Making sure that you duplicate power, not energy.)

### Price Predictions

We can obtain AEMO's price predictions (including the history of predictions made at various times for a given period) from "predispatch" data.
The predispatch process was explained [earlier](#predispatch-is-not-a-day-ahead-market).

There are 3 relevant tables.
Of these 3, `P5MIN_REGIONSOLUTION` and `PREDISPATCH` both contain a history of price predictions.
This can be tricky to get your head around at first.
Read the section earlier about [two-dimensional time](#two-dimensional-time).

* `DISPATCHPRICE` contains the actual, final price. (Do not forget to filter to include only `INTERVENTION==0`)
* `P5MIN_REGIONSOLUTION` contains predictions for the next hour or so, at 5 minute granularity. There are three datetime columns. `INTERVAL_DATETIME` is the end of the 5-minute period which the prediction was made _for_. `RUN_DATETIME` is the end of the 5-minute period when the prediction was published. `LASTCHANGED` is the exact time when the prediction was made. (`RUN_DATETIME` is just `LASTCHANGED` rounded up to the next 5 minute mark.)
* `PREDISPATCHPRICE` contains `DATETIME` (the end of the 5-minute period which the prediction applies to) and `LASTCHANGED` (when the prediction was generated). There is no `RUN_DATETIME` column. `PREDISPATCHSEQNO` is related to `LASTCHANGED` rounded up to the next 5 minutes, but in a format which is a bit awkward to use. So just round up `LASTCHANGED` instead. Do not forget to filter to include only `INTERVENTION==0`. `RRP` is the price column. The precise meaning of the price and other forecast values in this table is a bit nuanced. See [this article](https://wattclarity.com.au/articles/2021/06/oct2021-potential-tripwire-1-the-invisible-5-minute-trading-periods/) and [this article](oct2021-potential-tripwire-2-p30-predispatch-forecasts-after-5-minute-settlement-what-do-they-mean/). It is really every 6th 5-minute price. So my view is that you should linearly interpolate between these (based on interval end) to get the full 5 minute predictions. These predictions are only revised every half hour.

You can read more about how far the data extends and the different granularities in [Watt Clarity](https://wattclarity.com.au/articles/2021/06/oct2021-potential-tripwire-2-p30-predispatch-forecasts-after-5-minute-settlement-what-do-they-mean/).

These tables overlap.
The `P5MIN_REGIONSOLUTION` contains 'predictions' made in the same interval they apply to.
This is what `DISPATCHPRICE` does (which are definite, final prices, not predictions).
Given the timestamps, you would expect that `P5MIN_REGIONSOLUTION` is exactly the same as `DISPATCHPRICE` for rows where `INTERVAL_DATETIME == RUN_DATETIME`. However there are some slight approximations made in predispatch calculations, to speed the computation up. So predispatch is not _exactly_ the same algorithm as dispatch. Thus `P5MIN_REGIONSOLUTION` may be wrong for `INTERVAL_DATETIME == RUN_DATETIME`.
So choose `DISPATCHPRICE` for those rows.

There is also an overlap between `P5MIN_REGIONSOLUTION` and `PREDISPATCHPRICE` (even before interpolating). When this happens, use `P5MIN_REGIONSOLUTION`.
So for each interval the prediction was made for, for each interval the prediction was made in, if there are multiple rows, choose `DISPATCHPRICE`, then `P5MIN_REGIONSOLUTION`, then `PREDISPATCHPRICE`.
This is a good approach for operational queries, where you just filter for predictions for the next interval. 

For analytic queries, this data is large. In that case, doing a join and deduplication (e.g. vertical concatenation, then group by the two timestamp columns, sort by which table it came from etc) is very expensive (i.e. your laptop will run out of memory).
So you can filter each table instead with conditions about the distance between the two time columns.

* `DISPATCHPRICE` for the actual price
* `P5MIN_REGIONSOLUTION`: filter to `RUN_DATETIME` < `INTERVAL_DATETIME`, to get medium-term, 5-minute granularity forecasts, up to 2 hours in advance. e.g. the earliest prediction for the 01:00-01:05 interval (`INTERVAL_DATETIME` 01:05) is published in the 00:00-00:05 interval (e.g. `LASTCHANGED` 00:00:30)
* `PREDISPATCHPRICE`: filter to `LASTCHANGED < DATETIME - 1 hour`. i.e. predictions made more than 1 hour in advance.

If these last few paragraphs were unclear, just read the code in example below.

Most `PREDISPATCH*` tables are very large.
So there is a subset of each `PREDISPATCH*` table in the normal `DATA` folder on Nemweb. The full dataset is in `../PREDISPATCH_ALL_DATA` (as mentioned [earlier](#where-is-the-data)):

e.g.

<https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/2025/MMSDM_2025_10/MMSDM_Historical_Data_SQLLoader/PREDISP_ALL_DATA/PUBLIC_ARCHIVE%23PREDISPATCHPRICE%23ALL%23FILE01%23202510010000.zip>

This is true even for `PREDISPATCHPRICE`, even though it is a moderate size.

::: {.code-snippet}
[`prediction-convergence.ipynb`](./examples/prediction-convergence.ipynb)
:::

In this example I try to analyse how AEMO's price predictions get more/less accurate depending on how far in advance they are made.
Specifically I compare whether the predictions are on the correct side of 0 $/MWh.
I expected them to get monotonically better (i.e. downward sloping graph), but that is not the case. 
The rise around 24 hours shows that sometimes the closer we get to the time period AEMO is predicting, the worse the predictions get (for some regions, for some hours out, for this particular definition of "worse").

[![Graph](examples/results-2.svg)](examples/results-2.svg)


### Grouping By Fuel Type

The fuel type (e.g. coal vs solar) of each generator can be found in the list of [registered participants](https://www.aemo.com.au/energy-systems/electricity/national-electricity-market-nem/participate-in-the-market/registration) (file "NEM Registration and Exemption List", sheet "PU and Scheduled Loads").
Nemosis gives us an easy way to download this with the ["Generators and Scheduled Loads" table](https://github.com/UNSW-CEEM/NEMOSIS/wiki/AEMO-Tables#generators-and-scheduled-loads-generators-and-scheduled-loads).
Although at the time of writing, AEMO has recently changed their firewall rules in a way which [breaks Nemosis](https://github.com/UNSW-CEEM/NEMOSIS/issues/60). The example below shows how to use Nemosis, and how to use a workaround.

There are multiple columns relating to fuel type, with quite varied, detailed, inconsistent and even misspelled values.
You will probably need to hard code some if statements to classify these into something simpler. 

::: {.callout .warning}
Watch out: If a generator's fuel type includes the substring "gas", it might be "biogas" or "landfill gas", which is biofuel not natural gas. 
If a generator's fuel type includes the word "coal", it might be "coal seam gas", which is gas not coal.
:::

This example uses [Polars](https://pola.rs/).

::: {.code-snippet}
[`static.py`](./examples/static.py)
:::

Note that rooftop solar is not included here because it does not have a `DUID`. Some generators appear here, but not elsewhere, because they are non-scheduled. Some generators appear elsewhere but not here because they have been decommissioned.

### Emissions Data

The emissions intensity of generators (a static value representing the average emissions in tonnes of CO2e per MWh) is published in the `GENUNITS` table in the usual `MMSDM` location. This also contains columns about the provenance of this emissions intensity data.
This is per-genset (`GENSETID`), which means there may be more than one value per `DUID`. (See [the hierarchy earlier](#duid-genset-id-etc).)
Most power data is `DUID` level, so we need to aggregate somehow. This example shows one way to do that.

::: {.code-snippet}
[`emissions.py`](./examples/emissions.py)
:::

You could join this with generator-level power data to get generator-level emissions.
In theory you can do this at a 5 minute granularity.
However you should smooth things out to a larger timescale before interpreting, because this is _average_ emissions intensity.
e.g. coal generators emit a lot of CO<sub>2</sub> when starting up, hours before the export the first MWh, and the efficiency depends on the power level.
(More generally, you should be very wary of any causal inference at the 5 minute level. Fossil fuel generators and [even wind/solar/batteries](../diagonal-dispatch/) make decisions over time with dynamic constraints. Intervals are not really independent.)

There is daily region-level emissions (and per-generator emissions intensity data again) in the [`CDEII` subdirectory](https://www.nemweb.com.au/REPORTS/CURRENT/CDEII/) of the [realtime data](https://www.nemweb.com.au/REPORTS/CURRENT/CDEII/) folder. (I do not know what the acronym `CDEII` means. I do not know why it is not published in the usual `MMSDM` folder.)

<https://www.nemweb.com.au/REPORTS/CURRENT/CDEII/>

Whilst most other realtime data in `/CURRENT/` is [harder to parse](#file-format-details-and-other-data-files) than the monthly data, thankfully this data is only one table per CSV (with a [header, footer and 4 metadata columns](#quick-file-format-explanation-for-monthly-mmsdm-data)), like the monthly data.

Unlike most data on Nemweb, these files are small, and some are published as uncompressed CSVs, not zips of CSVs.
This means that most libraries can read them from the URL directly.
(It is normally good practice to download the files and then read them, so you do not put load on AEMO's servers and wait for a download every time you run a query.)

[`CO2EII_AVAILABLE_GENERATORS.CSV`](https://www.nemweb.com.au/REPORTS/CURRENT/CDEII/CO2EII_AVAILABLE_GENERATORS.CSV) is per-generator emissions intensity. These figures may differ slightly from those in `GENUNITS`.
I do not know what the adjacent `CO2EII_AVAILABLE_GENERATORS_YYYY_*.CSV` files are in the [CDEII](https://www.nemweb.com.au/REPORTS/CURRENT/CDEII/) folder.
This file structure and versioning approach is different to all other AEMO data.

[`CO2EII_SUMMARY_RESULTS.CSV`](https://www.nemweb.com.au/REPORTS/CURRENT/CDEII/CO2EII_SUMMARY_RESULTS.CSV) contains daily emissions data per region.
(Despite the fact that the timestamp contains an hour and minute part, this is daily data. The hour and minute are always midnight.)
The columns are not documented.
Based on what ballpark the numbers are in, my belief is that:

- `TOTAL_SENT_OUT_ENERGY` is in MWh. 
- `TOTAL_EMISSIONS` is in tonnes of CO<sub>2</sub> equivalent.
- `CO2E_INTENSITY_INDEX` is tonnes of CO2e per MWh. (This is my guess. Although I cannot find documentation to confirm this, or confirm that it is loss-adjusted.)

The [monthly data](https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/2025/MMSDM_2025_05/MMSDM_Historical_Data_SQLLoader/DATA/) does not include any tables called `CDEII`, but does include something with `CO2E` in the name (`BILLING_CO2E_PUBLICATION`).
This appears to be the same data as [`CO2EII_SUMMARY_RESULTS.CSV`](https://www.nemweb.com.au/REPORTS/CURRENT/CDEII/CO2EII_SUMMARY_RESULTS.CSV), but with a few extra columns (and only for one month).
I would not be surprised if the emissions numbers themselves differed slightly.
If so, my guess is that the monthly one is more accurate, because it is "billing" quality.

If you find out more, please reach out to me so I can add more detail here for others. ([LinkedIn](https://www.linkedin.com/in/mdavis-xyz/), or [raise an issue](https://github.com/mdavis-xyz/mdavis.xyz/issues) on GitHub.)

## I Feel Your Pain

As you delve into the world of AEMO's data, you will come across countless inconsistencies which will drive you mad.
You need to be prepared to roll with the punches.
Just remember to be thankful that we have this data at all.
I do not know of any other grid or industry with this much public data.

Examples of inconsistencies:

- AEMO have standard file formats for most of their data. However for some data (e.g. price setter data, or 4 second SCADA data) they choose something different, like XML.
- AEMO publishes new schemas about twice a year. They have a well defined system, with consultation and clear major and minor version numbers. They often add new columns, but rarely delete old ones or change column order. The `DISPATCHREGIONSUM` table has several columns at the end about aggregate renewables. Despite sounding promising, these are always empty. When I asked why, I was told that it is something they plan to add in the future. So they are effectively adding this columns to this one table in a way which is outside their normal schema versioning process for all other tables.
- AEMO have the MMS dataset on Nemweb and the FTP servers, which contains hundreds of different tables. However for some data (e.g. the [Participant Registration List](https://aemo.com.au/energy-systems/electricity/national-electricity-market-nem/participate-in-the-market/registration)) they publish it as an excel file on their aemo.com.au web page. For most of AEMO's data, they keep all version history (e.g. each iteration of a price forecast). However when generators retire, they are [deleted from this registration form](https://github.com/UNSW-CEEM/NEMOSIS/wiki/AEMO-Tables#generators-and-scheduled-loads-generators-and-scheduled-loads), instead of just adding a column to mark them as retired. They changed the firewall rules for this other domain while I was writing this blog post, which [broke Nemosis](https://github.com/UNSW-CEEM/NEMOSIS/issues/60). This breakage applies even to market participants with FTP access, because they do not publish this file through the usual channels.
- Additionally, in this same list of generators:
    - There are spelling mistakes, such as "Photovoltalic" and "Natrual Gas".
    - All batteries are listed with a "Fuel Source - Primary" of "Battery Storage", except for the Hornsdale battery, which is listed as "Wind". (Probably because it was the first battery, and the registration rules have changed since then.)
    - The interconnector between Tasmania and Victoria (Basslink) is in the registration list. Other HVDC interconnectors are not listed.
- Some batteries are registered as one `DUID`, some are two (one for charge, one for discharge). Even when there are two, the power values can be both positive and negative for both of them.
- Some non-scheduled generators have no `DUID`, but some do.
- Typically each monthly file ends with the 5 minute period before the 5 minute period that the next month starts with. Except for one month where they overlapped.
- For some months, some tables are missing. They are present for earlier and later months.
- Up to July 2024 the filenames on Nemweb were like `PUBLIC_DVD_ANCILLARY_RECOVERY_SPLIT_202309010000.zip`. Then the month after that they changed to `PUBLIC_ARCHIVE#ANCILLARY_RECOVERY_SPLIT#FILE01#202409010000.zip`. This broke webscraping scripts. When writing scripts today you must handle both cases.
- The [schema documentation](https://nemweb.com.au/Reports/Current/MMSDataModelReport/Electricity/Electricity%20Data%20Model%20Report.htm) groups similar tables together. When the data for tables is combined into multi-table CSVs for the [realtime](https://www.nemweb.com.au/REPORTS/CURRENT/) data, they are partitioned into different groups.
- There are tables with `CDEII` in the name which are about emissions in the daily data, but not the monthly data. The monthly data contains tables with `CO2` in the name, which are not in the daily data. Neither is in the documentation. Unlike all the other daily data, `CDEII` is published as uncompressed CSV files, instead of zips of CSVs. 
- The [`INTERVENTION`](#intervention) column is always a `1` or `0`, although the schema documentation says they can take a range from 0 to 99.  _Except_ for table `GENCONSETINVOKE`, where it is a `VARCHAR2(1)` with values `Y` or `N` (even though the documentation comment says it is `0` or `1`).
- Data types in the documentation are normally like `NUMBER(2,0)`, but sometimes they are `Number(2,0)` or `Number (2,0)`
- The `MAXCAPACITY` and `REGISTEREDCAPACITY` columns in `DUDETAIL` are described as integers in the schema documentation. However in the actual CSV data they are floats, with non-zero decimal parts. If you use AEMO's PDR Loader, you will lose the decimal part. (I notified AEMO about this. They said it is not a bug.)
- The [list of tables](https://nemweb.com.au/Reports/Current/MMSDataModelReport/Electricity/Electricity%20Data%20Model%20Report_files/Elec80_8.htm) in the documentation sometimes has spaces in the middle of table names. (e.g. `SET_APC_COMPENSATION` used to appear as `SET_ APC_COMPENSATION`, thus making it difficult to find the table you want with ctrl-F) 
- Sometimes the column names in the documentation are incorrect. e.g. for table `DISPATCHCONSTRAINT`, the documentation says `DUID`, but the actual CSV has column `CONFIDENTIAL_TO`. The documentation for table `MTPASA_REGIONRESULT` says there is a column `TOTALSEMISCHEDULEGEN10`, but the actual CSV contains `TOTALSEMISCHEDULEDGEN10` (with an additional `D`).

## Further Reading

AEMO implements the National Electricity Rules (NER) written by the Australian Energy Market Commission. These rules are available [here](https://energy-rules.aemc.gov.au/ner/714).

[Watt Clarity](https://wattclarity.com.au/) is a blog by a market consultant (Global Roam). They have:

- explainers for concepts such as "how is the price set?", "what is FCAS?" ([example](https://wattclarity.com.au/articles/2022/09/analyticalchallenge-installedcapacity/)),
- analysis of market trends and policies,
- autopsies of specific events (e.g. "what happened last Tuesday?")

Whilst they are a business trying to sell consulting services and market reports, I find the free content on their site to be very high quality, useful and unbiased.

The benefits of Parquet over CSV are described in [R for Data Science](https://r4ds.hadley.nz/arrow#advantages-of-parquet). (Apache Arrow has similar benefits.)

## Legal Junk

Any opinions in this post are my own, and do not necessarily reflect that of my employer. 
But you already knew that.

(In fact, at the time of writing I have no employer. I have recently finished my [../masters-thesis](master's degree) and have not yet started my new role.)

In this post I have made several criticisms of AEMO. 
However I am still very grateful that they publish this data at all. This is far better than any other grid operator I have encountered.
Whilst the documentation and consistency is sometimes lacking, it is better than most comparable datasets.

## Where To Go Next

If you have questions (or corrections), reach out to me on [LinkedIn](https://www.linkedin.com/in/mdavis-xyz/), or [raise an issue](https://github.com/mdavis-xyz/mdavis.xyz/issues) on the GitHub repo for this website.
You can also try asking on the [Nemosis mailing list](https://groups.google.com/g/nemosis-discuss).
