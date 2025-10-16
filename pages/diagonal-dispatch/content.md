In a typical electricity spot market time is divided up into discrete periods or intervals. Within these intervals prices are constant. There are discontinuous steps at the boundaries between trading intervals. 
However, to maintain the stability of the electrical grid, the physical power output of generators (and storage) based on these discontinuous prices are not themselves discontinuous. 
Rather, the quantity obtained for each generator from the intersection of supply and demand curves is used as a target that the generator must move towards, over time.
In Australia's National Electricity Market (NEM) generators must take the entire period to adjust their output, even if they could physically adjust more quickly ([NER Clause 4.9.2](https://energy-rules.aemc.gov.au/ner/621/526154#clause_4.9.2)).
This means that prices are piecewise-_constant_, or 'step' functions, but quantities are 'diagonal' piecewise-_linear_ 'dot-to-dot' functions.
Papers such as 
[Xia and Elaiw (2010)](https://www.sciencedirect.com/science/article/pii/S0378779610000027)
and 
[Wei et al. (2020)](https://ietresearch.onlinelibrary.wiley.com/doi/epdf/10.1049/iet-gtd.2020.1329)
consider physical limits on ramp rates (production level adjustment rates) arising from technical limitations of each generator, and how this impacts bidding strategies and social optimums. In contrast, this post considers limits imposed by the market operator ([AEMO](https://aemo.com.au/)) which may restrict adjustment speed to rates slower than what the asset can physically do.
This distinction is most relevant for batteries.

Consider the following example prices.
The price starts above a generator's marginal cost ("MC", assumed to be bid truthfully), drops below, and then rises back up.

<div class="graph">
![Prices over time](graphs/price.svg)
</div>

Under standard economic assumptions the generator and the social planner (i.e. AEMO) want the generator to instantaneously reduce power output to 0% at the start of period 2. 

<div class="graph">
![Stepped power over time](graphs/power-1.svg)
</div>

However, to ensure grid stability AEMO will instead instruct the generator to ramp diagonally from its starting power level (100% in this case) to 0, over the interval (shown as the <span style="color: #FF0000;">red</span> curve).
The same is true of scheduled loads and storage.
Note that this is true even for assets which are physically able to adjust production level almost instantly (e.g. solar, batteries).
(For coal and gas, the ramp limits imposed by the physical limitations of the equipment are already substantial on a 5-minute timescale.)

<div class="graph">
![Diagonal power over time](graphs/power-2.svg)
</div>


Consequently, the <span style="color: #FF0000;">red</span> curve has an average power of 50% over interval 2, so it is 'half-on', despite having a bid higher than the cleared price.
This means that the generator is losing money in interval 2, and missing out on money in interval 4. 
The following table shows the revenue for the theoretical "stepped" and more realistic "diagonal" curves, based on the example prices above, for a 1 MW generator and 5 minute intervals.

::: {.profit-table}
+--------+-----------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
|        |           | Step (Theory)                         |   | Diagonal Off-On (Reality)             |
+--------+-----------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
| Time   | Period    | 1     | 2     | 3     | 4     | 5     |   | 1     | 2     | 3     | 4     | 5     |
|        | Start     |       |       |       |       |       |   |       |       |       |       |       |
|        +-----------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
|        | Period    | 2     | 3     | 4     | 5     | 6     |   | 2     | 3     | 4     | 5     | 6     |
|        | End       |       |       |       |       |       |   |       |       |       |       |       |
+--------+-----------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
| Power  | Start     | 1     | 0     | 0.4   | 1     | 1     |   | 1     | 1     | 0     | 0.4   | 1     |
| (MW)   |           |       |       |       |       |       |   |       |       |       |       |       |
|        +-----------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
|        | End       | 1     | 0     | 0.4   | 1     | 1     |   | 1     | 0     | 0.4   | 1     | 1     |
|        +-----------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
|        | Average   | 1     | 0     | 0.4   | 1     | 1     |   | 1     | 0.5   | 0.2   | 0.7   | 1     |
+--------+-----------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
| Price - MC         | +2    | -1    | 0     | +2    | +2    |   | +2    | -1    | 0     | +2    | +2    |
| ($/MWh)            |       |       |       |       |       |   |       |       |       |       |       |
+--------+-----------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
| Profit ($)         | 0.500                                 |   | 0.408                                 |
+--------+-----------+---------------------------------------+---+---------------------------------------+
:::

This requirement that the generator take the entire period to ramp to the target power level reduces generator profit in this stylised example by 20%. (For an asset which is physically capable of ramping far faster.)
The generator in this example would make more profit by strategically lowering their bid in interval 2 below marginal cost, to ensure they are fully on in interval 4.

<div class="graph">
![Stay on](graphs/power-3.svg)
</div>

::: {.profit-table}
+--------+---------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
|        |         | Diagonal Off-On                       |   | Stay On                               |
+--------+---------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
| Time   | Period  | 1     | 2     | 3     | 4     | 5     |   | 1     | 2     | 3     | 4     | 5     |
|        | Start   |       |       |       |       |       |   |       |       |       |       |       |
|        +---------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
|        | Period  | 2     | 3     | 4     | 5     | 6     |   | 2     | 3     | 4     | 5     | 6     |
|        | End     |       |       |       |       |       |   |       |       |       |       |       |
+--------+---------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
| Power  | Start   | 1     | 1     | 0     | 0.4   | 1     |   | 1     | 1     | 1     | 1     | 1     |
| (MW)   |         |       |       |       |       |       |   |       |       |       |       |       |
|        +---------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
|        | End     | 1     | 0     | 0.4   | 1     | 1     |   | 1     | 1     | 1     | 1     | 1     |
|        +---------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
|        | Average | 1     | 0.5   | 0.2   | 0.7   | 1     |   | 1     | 1     | 1     | 1     | 1     |
+--------+---------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
| Price - MC       | +2    | -1    | 0     | +2    | +2    |   | +2    | -1    | 0     | +2    | +2    |
| ($/MWh)          |       |       |       |       |       |   |       |       |       |       |       |
+------------------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
| Bid - MC         | 0     | 0     | 0     | 0     | 0     |   | 0     | < -1  | < 0   | 0     | 0     |
| ($/MWh)          |       |       |       |       |       |   |       |       |       |       |       |
+--------+---------+-------+-------+-------+-------+-------+---+-------+-------+-------+-------+-------+
| Profit ($)       | 0.408                                 |   | 0.417                                 |
+--------+---------+---------------------------------------+---+---------------------------------------+
:::


A contribution of this post is to show that even in the absence of market power, startup costs, _physical_ ramp rate limits, and with perfect foresight of prices, rational profit-maximising firms should submit bids which do not match their marginal costs.
This novel finding illustrates how simplified analysis using stepped power levels yields qualitatively incorrect conclusions about optimal strategies.

Whilst this insight is most pertinent for batteries, it can apply to other fuel types too.
In my previous job I designed an algorithm to submit bids for a wind farm which was physically capable of ramping by a substantial fraction of its nameplate capacity within a 5 minute interval. I had to account for this effect, rebidding to deliberately _avoid_ ramping down and then back up when the price dips below marginal cost for only one period.

## Simulations

The aim of this section is to determine whether the use of the "stepped" approach in academic or investment modelling introduces material errors.
For coal, gas, hydro and wind, the asset typically cannot adjust its power level within a trading period, so any modeller should already be considering dynamic constraints.
However many researchers use the step model for battery analysis (e.g. [Lamp and Samano 2022](https://tintin.hec.ca/pages/mario.samano/EECC/Lecture-4/Batteries_Lamp_Samano_EneEcon_published.pdf); [Giulietti et al. 2018](https://journals.sagepub.com/doi/pdf/10.5547/01956574.39.SI1.mgiu)).
The next section explores when and to what extent this simplification is an _over_-simplification.
To do so, I constructed a simple battery operation optimisation problem, using real price data, and then I compared the energy, revenue and cycles for both the diagonal and stepped power levels.

5-minute spot prices were obtained from [AEMO's Nemweb](https://www.nemweb.com.au/Data_Archive/Wholesale_Electricity/MMSDM/2025/MMSDM_2025_01/MMSDM_Historical_Data_SQLLoader/DATA/) with [Nemosis](https://github.com/UNSW-CEEM/NEMOSIS/).
The analysis period is 2024.
The battery is sized at 1 MW, 2 hours depth, with 80% round trip efficiency.
Perfect foresight is assumed.
[Pyomo](https://www.pyomo.org/about) (a linear optimiser) was used to identify the optimal charge and discharge schedule to maximise energy arbitrage revenue. 
Ancillary service revenue and other 'revenue stacking' is neglected (despite making up [approximately half of battery revenue](https://doi.org/10.5547/01956574.45.1.jgil) in practice) because the linear constraint in question only applies to energy. 

Here is a subset of the time series results:


<div class="graph">
![Simulation results timeseries snippet](simulation-results.svg)
</div>

Note that the "stepped" approach yields many single-period power spikes, which are not realistic. The diagonal approach is a more realistic, smoothed power curve.

The aggregate results are:

::: {#aggregate-results}
+----------------+------+----------+------------+--------+----------+------------+
| Region         | Energy (GWh)                 | Profit ($k)                    |
|                +------+----------+------------+--------+----------+------------+
|                | Step | Diagonal | Difference | Step   | Diagonal | Difference |
+----------------+------+----------+------------+--------+----------+------------+
| New South      | 2.17 | 2.06     | 4.8 %      | 482.3  | 465.4    | 3.5 %      |
| Wales          |      |          |            |        |          |            |
+----------------+------+----------+------------+--------+----------+------------+
| Queensland     | 2.27 | 2.17     | 4.3 %      | 394.8  | 381.4    | 3.4 %      |
+----------------+------+----------+------------+--------+----------+------------+
| South          | 2.51 | 2.46     | 2.1 %      | 445.9  | 425.8    | 4.5 %      |
| Australia      |      |          |            |        |          |            |
+----------------+------+----------+------------+--------+----------+------------+
| Tasmania       | 2.03 | 2.01     | 1.0 %      | 205.3  | 196.2    | 4.4 %      |
+----------------+------+----------+------------+--------+----------+------------+
| Victoria       | 2.43 | 2.38     | 2.1 %      | 295.9  | 284.1    | 4.0 %      |
+----------------+------+----------+------------+--------+----------+------------+
:::


The absolute level of each metric is unimportant for our purposes. The key question is merely whether there is an economically significant difference between the stepped and diagonal models.
For the total amount of energy stored, and the profit made by batteries, the impact of neglecting the diagonal constraint is that the numbers are inflated by up to 4.5%.
This is large enough to be consequential for some academic research questions.
Note that these simulations ran faster with the diagonal ramping than without, so computational feasibility is probably not a valid justification for ignoring diagonal ramping.
Therefore researchers should account for the piecewise-linear constraint unless they have a good reason not to.

For practitioners, this reduction in profitability is so economically significant that it may make or break the business case for a particular investment.
The total amount of energy stored and discharged is lower in the diagonal case. As a silver lining, this corresponds to fewer full cycles, which is good from a warranty perspective.

When accounting for the diagonal piecewise-linear constraint, the optimal charge/discharge strategy is more smooth, and has fewer single-interval dips/spikes.


## Model

In my [masters thesis](../masters-thesis) I present an algebraic model, to demonstrate that the effect of this diagonal constraint is that for a given trading interval, each generator 'sees' an average of the current and prior price. This effectively suppresses the economic signal in a single-interval price spike/dip.


## Comparison to Europe

In Europe, prior to 2011 there were no rules specifying how generators were to adjust output within each trading period, as long as the average physical output each period matched the commercial target. This resulted in deterministic imbalances at the start of each hour, which [increased costs and emissions](https://eepublicdownloads.entsoe.eu/clean-documents/pre2015/publications/entsoe/120222_Deterministic_Frequency_Deviations_joint_ENTSOE_Eurelectric_Report__Final_.pdf). Since then the rules around balancing have changed.
For example, the transmission lines connecting the Nordic regions to the rest of Europe are required to adjust their output [over 10 minute blocks](https://consultations.entsoe.eu/system-operations/nordic-tsos-methodology-for-ramping-restrictions-f/supporting_documents/230130%20Explanatory%20Document%20for%20Ramping%20restrictions%20for%20active%20power%20output%20amended%20for%20public%20consultation.pdf), to help mitigate these deterministic imbalances.
Europe's balancing rules are relatively complicated compared to other markets, and vary from country to country. The findings of this simulation cannot be directly applied to Europe. 
It might or might not be the case that investors and researchers should account for such ramping rules in their modelling.

## Conclusion

Even if an asset such as a solar farm or battery is able to adjust its power output within seconds, AEMO requires that they take the entire 5 minute period to do so.
This leads to an economically significant reduction in profit. 
Therefore academic researchers and investors looking at Australia's NEM should account for this diagonal dispatch constraint in their modelling.

This topic is one chapter of my [masters thesis](../masters-thesis).