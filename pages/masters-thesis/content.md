
The wholesale price of electricity tends to be far more volatile than the prices of most other commodities.
The main reason is that electricity cannot be stored cheaply (even with recent advances in battery technology), so supply and demand must be balanced on the timescale of seconds. This is coupled with relatively high reliability requirements compared to most goods, due to the essential nature of the service.
Another reason is that consumers are usually exposed to flat tariffs. This means that in the short term demand is inelastic. In most markets an increase in price will increase supply and decrease demand. 
In electricity markets an increase in price will barely decrease demand. 
Therefore large price variations are required to balance supply and demand, because only one side of the market responds meaningfully to short term price signals.

Price volatility can be politically undesirable, as consumers prefer predictable electricity bills.
Investors building generators also tend to prefer price certainty.
However, the large magnitude of variation in electricity spot prices reflects how the true cost and value to society of electricity consumption varies drastically over hours, minutes and even within a single second.
Some units of energy (megawatt hours) are worth ten thousand times more than others, due to a difference in when they are delivered. 
Consumers and generators often face incentives which do not reflect this variation.
The purpose of this thesis is to investigate such missing markets, and market design failures, through a series of example cases, with a focus on Europe and Australia.

This thesis is the culmination of a two-year [Master of Environmental Policy and Energy Economics](https://www.tse-fr.eu/master-environmental-economics-and-policy) at [the Toulouse School of Economics (TSE)](https://www.tse-fr.eu/), in France.
It was written from March to August 2025 under the supervision of [Professor François Salanié](https://www.tse-fr.eu/people/francois-salanie).

Through this thesis I have combined the economic theory taught in this masters course with my experience in the industry to generate several interesting insights.
I designed several formal algebraic models for this thesis.
A key challenge for theoreticians when constructing such models is to simplify the problem enough to be tractable, whilst retaining enough complexity and nuance to capture the true nature and tradeoffs of the problem. My experience in electricity trading and dispatch inspired these models and helps ensure their relevance.
In addition to theoretical models, this thesis also includes a policy review of capacity markets. This entails the collation of many facts to distil a complex issue into a research-driven story.

Most parts of this thesis include data analysis, either to motivate the problem or test a model.
Regressions were performed in R. Data wrangling, simulations and exploratory analysis and graphing was done with Python. 
The code for all simulations and regressions is available on [GitHub](https://github.com/mdavis-xyz/masters-thesis).



<div class="center" id="download-wrap">
   <a href="Masters-Thesis-Matthew-Davis.pdf" class="button" id="download" >Download PDF</a>
</div>

Part 1 explores payments for spinning reserves, also known as contingency raise services.
Payments for reserves are somewhat unique to the electricity sector.
Dairy farmers are not paid for the ability to increase production in case their neighbour's production drops unexpectedly. Electricity generators are.
This is due to the fact that after a large shock, electricity supply and demand must be balanced on a subsecond timescale.  (The reserves may also be called upon after a demand shock or transmission outage.) 

A contribution of Part 1 is the clear explanation for a non-technical reader of the difference between spinning reserves and stationary reserves.
This is followed by an algebraic derivation of the equilibrium cost of reserves. 
This model is based on [Gilmore, Nolan, and Simshauser (2024)](https://doi.org/10.5547/01956574.45.1.jgil), but is extended in several respects. Increasing marginal costs are used instead of a constant marginal cost. The model includes a fixed operating cost component and the possibility of a generator turning off completely, to model the important distinction between stationary and spinning reserves. The model is extended to make demand for reserves endogenous, depending on demand for energy.
The nature of this endogeneity is tested empirically with ARIMA regressions.
Part 1 also includes mathematical proofs of an intriguing case where aggregate marginal costs for a good decrease as the quantity demanded increases.
It concludes with a discussion drawing parallels between ancillary markets for spinning reserves and markets for installed capacity.

Capacity markets for _installed_ capacity are a hot topic in the industry at the moment.
In theory an energy-only market (where generators are paid only per unit of energy they produce) should drive investment to the optimal level.
Proponents of capacity markets argue that the energy-only paradigm yields insufficient revenue in practice, resulting in underinvestment. This can only be true if there is a market failure, or a missing market. 
However, many proponents are unable to precisely identify such a cause.

Part 2 is a literature review and discussion of the potential market failures and missing markets which motivate the introduction of capacity markets. The most pertinent market failure is the presence of an inefficiently low spot price cap.
The most relevant missing market is typically the absence or low liquidity of long term hedging markets.
The section explores how capacity markets often fail to achieve their objectives. They are often designed without regard for the reliability targets which they are supposed to achieve, and they can exacerbate the very "missing money" problem which they are intended to solve.
Part 2 also includes a discussion of how the metric for capacity is quite difficult to define in a way which does not create perverse incentives.
Capacity payment metrics typically lead to operational and investment distortions, rewarding poor performers who contribute little energy during critical periods.
This metric is typically defined in a way which explicitly discriminates based on fuel type, directly counteracting climate policy objectives, and is effectively a departure from a liberalised market to one of a central planner picking winners.
Part 2 includes an analysis of data showing trends in capture price ratios, as a demonstration of how two generators with the same capacity can provide vastly different social value.


[Part 3](../solar-tilt) explores these differences in the value of a megawatt within a given fuel type, from a theoretical perspective. It does so by introducing a model concerning the angle which solar panels are mounted at. Conventional wisdom says that panels should be installed at an angle equal to their latitude, and facing north/south towards the equator. This maximises the volume of energy produced. However, a panel which faces further west and more vertically, produces more energy in winter and late afternoons, when each unit of energy is more valuable. This tradeoff is explored in the model to demonstrate how the objective of investment should be to maximise the _value_ of energy produced, not the _volume_. This is coupled with simulations showing that rooftop solar support schemes can distort this tradeoff such that up to half the social value of solar panels is wasted.

The model from Part 3 is then extended in Part 4 to combine solar panels with a battery. The purpose of this extension is to challenge the common misconception that combining solar panels with a battery increases the project's spot market revenue. Batteries do indeed add value by acting as a 'solar sponge', shifting surplus generation from the middle of the day when prices are low and the sun is high, to the afternoon and evening when prices are high and the sun is low or absent. 
However, batteries can provide this service without necessarily being located on the same premise, or even owned by the same firm or household. There are many logistical benefits from installing solar and batteries together ("colocation"). The purpose of this model is to demonstrate that from a pure spot market revenue perspective, colocation provides no increase in revenue, and may even reduce revenue, compared to solar and batteries installed separately.


Many of the challenges and quirks of electricity markets are due to the fact that most consumers pay a price for energy which is different to the marginal cost to produce that energy. Due to a strong political aversion to bill shock and the historical impracticalities of real time metering, customers face a fixed tariff instead of the wholesale price.
Part 5 introduces a model, based on a simplification of [Borenstein and Holland (2005)](http://www.jstor.org/stable/4135226), to explore the inefficiency which this creates.


Electricity retailers offer these fixed tariffs to consumers, and are exposed to the variable wholesale price. This introduces a risk, which depends on the joint distribution of spot prices and consumers' daily consumption profiles.
Part 6 explores the risk-return tradeoff of a retailer choosing an optimal portfolio of heterogenous customers. Parallels then are drawn to show that this is similar to to the [Capital Asset Pricing Model (CAPM)](https://en.wikipedia.org/wiki/Capital_asset_pricing_model).

In Part 7 the discussion returns to the supply side.
In electricity spot markets the price changes abruptly at the boundary between trading intervals, but the physical output of electricity generators cannot change instantaneously.
Technical limits on the rate of adjustment (ramping) of generators have been well studied in the engineering and economic literature. 
However, some markets such as Australia's National Electricity Market (NEM) specify a minimum duration for adjustment, even if the generator is physically capable of adjusting far more quickly.
Part 7 explores the impact of this limit.
A unique contribution of this section is to show that even with perfect foresight, no market power, no startup costs and no _physical_ ramp rate limits, a rational profit-maximising firm may still want to submit bids which differ from their marginal cost.
Additionally, an algebraic model is introduced to demonstrate that this ramping constraint mutes the incentives created by price spikes. 
Many researchers and market participants ignore this limitation imposed by the market operator. 
Part 7 concludes with simulations in Australia's NEM, to show empirically that the impact of this limit on modelling results can be economically significant.


<div class="center" id="download-wrap">
   <a href="Masters-Thesis-Matthew-Davis.pdf" class="button" id="download" >Download PDF</a>
</div>
