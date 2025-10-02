
"Colocation" refers to installing batteries and solar (or wind) together at the same site.


<div class="wiring">

![Solar panel and battery colocated](wiring-svgs/together.svg)

</div>

When examining the benefits of colocation, many investors, grid operators and policy makers choose a solar project without batteries as the counterfactual.

<div class="wiring">

![Solar only](wiring-svgs/solar-only.svg)

</div>

Given the high upfront cost of batteries, a more suitable counterfactual is that of solar and batteries installed at separate locations, possibly by separate firms.

<div class="wiring">

![Solar and battery, separate installations](wiring-svgs/separate.svg)

</div>

From this perspective, there are many practical benefits of battery colocation. For example:

- Only one network connection is needed. This matters because grid connections are often scarce, and costly to acquire ([Zhao et al., 2015](https://www.sciencedirect.com/science/article/pii/S0306261914004668)).
- Network charges, charges for ancillary services, and dispatch target deviations due to weather forecast errors can be improved through co-optimising ([Yang et al., 2021](https://www.sciencedirect.com/science/article/pii/S2352152X21003121), [Ma et al., 2019](https://ieeexplore.ieee.org/document/8730659)).
- There are efficiencies of scale for project management. e.g. Electricians only need to visit one site to maintain both panels and batteries.

Many researchers and industry participants conflate these benefits with the direct spot-revenue impact of charging a battery from solar.
[Naemi et al. (2022)](https://www.sciencedirect.com/science/article/pii/S0959652622034795),
[Zhao et al. (2015)](https://www.sciencedirect.com/science/article/pii/S0306261914004668) and
[Wong et al. (2019)](https://www.sciencedirect.com/science/article/pii/S2352152X18303803) suggest that batteries help solar (or wind) generators store power when the sun is shining and prices are cheap, and discharge it later when prices are higher.
Whilst this 'solar sponge' approach does yield higher revenue than a solar farm without a battery, it also costs more to build. Conditional on buying a battery, it is not obvious whether colocation has any impact on pure spot revenue, compared to a solar farm and battery installed separately.

As an example, a common argument is that when spot prices go negative (or below zero minus the subsidy price) a colocated project can charge the battery for free using on-site solar generation, without wasting that sunlight or paying to export. However, in such a situation it would be more profitable to withhold the solar generation (waste sunlight) and get paid to charge from the grid at the negative price. This is exactly how separate batteries and solar would behave (either if owned by the same firm, or separate firms). Therefore I argue that time-shifting renewable power to increase revenue (or decrease emissions) is not a valid argument in favour of colocation. That would happen without colocation.

The purpose of this post is to extend [my other model about vertical solar panels](../solar-tilt) to investigate the impact of colocation on spot market revenue.
The angle at which solar panels are installed at is an investment decision, and the charging schedule of the battery is an operational decision.
I will investigate whether colocating batteries with solar changes the optimal angle which panels should be installed at, the optimal battery charging revenue, or total spot market revenue.
The logistical considerations mentioned above will be neglected for this model.
They may be significant factors which make colocation the right choice. However it is important that investors are precise about why they are choosing colocation. The purpose of this post is to explore the impact of colocation from a pure spot market perspective.

Only spot revenue will be considered.
Upfront investment costs will be neglected, since they would be the same with both colocation and separate sites.
It is assumed that the grid connection is not constrained.
This extension applies to large scale projects, because I assume revenue is based on spot price.
For households with solar and a battery, the same principles would apply, were they not distorted by fixed tariffs.

This work is part of my masters thesis, which is written up more formally [here](../masters-thesis).


## Solar With a Battery Which Can Charge From the Grid

This model builds on [my stylised model about vertical solar panels](../solar-tilt). The relevant points are that:

- There are 3 time periods:
    - midday (T<sub>1</sub>)
    - afternoon (T<sub>2</sub>)
    - evening (T<sub>3</sub>)
- Prices are low, medium and high respectively (p<sub>1</sub> < p<sub>2</sub> < p<sub>3</sub>)

For this post, I will just look at the 'vertical' case from that model. This means the panels produce δ of power in T<sub>2</sub> ( 0 < δ < 1), and 0 in the other time periods.
(For the more conventional case of panels oriented to produce maximum output at midday, the details are in [my thesis](../masters-thesis).)

<div class="graph">
![Solar only](charge-time/1-solar-only.svg)
</div>

Now suppose that we add a battery.
The operator faces the choice of whether to immediately export solar power when it is generated, or store it for later.
Most people say that we should charge the battery from the solar power (if the price increase between periods 2 and 3 is more than the round trip loss of storage).

<div class="graph">
![Battery charged from solar, with no arbitrage](charge-time/2-solar-charge-no-arb.svg)
</div>

This has increased the total revenue. However this is not the maximum revenue we can extract.
In this model I sized the battery to be slightly larger than what the solar panel produces. (The findings still hold if this is not the case. However the explanation is clearer if we use this approach.)
Suppose that in T<sub>2</sub> we charge the battery from solar, _and_ also charge from the grid to fill up remaining space in the battery.

<div class="graph">
![Battery charged from solar, with arbitrage in period 2](charge-time/3-solar-charge-with-arb-2.svg)
</div>

Charging from the grid as well as solar has increased our spot market profit. However this is still not the maximum profit we can make. We can charge from the grid in the prior period, when the price is lower. This reduces our charging cost.


<div class="graph">
![Battery charged from solar, arbitrage in period 1](charge-time/4-solar-charge-with-arb-1.svg)
</div>

However this is _still_ not the strategy which gives the maximum revenue.
People often think that since we're charging the battery from our own solar which has no marginal cost, then the charge cost (for that component of energy) is zero. This is not quite true. If we did not put that solar into the battery we would have instead sold it for p<sub>2</sub>. Therefore the opportunity cost of charging from solar is p<sub>2</sub>.
Is there a way of charging the battery for a cost lower than p<sub>2</sub>? 
Yes! We can charge in T<sub>1</sub> for p<sub>1</sub>.
We can charge the battery completely from the grid in T<sub>1</sub>, then export the solar power when we generate it in T<sub>2</sub>, then discharge the stored grid power in T<sub>3</sub>.

<div class="graph">
![Battery charged from grid, solar immediately exported](charge-time/5-solar-export-with-arb.svg)
</div>

This is the strategy which maximizes revenue for this setup.
Note that this is the same as the strategy which maximizes profit if the solar panels and battery are installed in separate locations (even if they are owned by separate firms). 
The best we can hope to achieve when the battery and solar panels are together is the same as what we would get if they were installed separately. Therefore colocating batteries and solar on the same site compared to different sites does not improve spot revenue.
In simpler terms, moving a battery and solar farm together, such that charging from solar is no longer an explicit expense, does not eliminate the opportunities and opportunity costs of supplying and consuming from the spot market.

In practice many projects are configured such that the battery can only charge from the solar panels, and not from the grid. This reduces spot revenue by reducing the set of possible arbitrage strategies. This restriction is typically due to both regulatory and technical reasons. These may be sound reasons, however anecdotally it seems that there is not wide recognition of the extent to which these reduces spot market profit.

Colocation may still be the best choice overall, especially if network connections are difficult to acquire. However it is important to be precise about what the benefits of colocation are. Acting as a 'solar sponge' to shift cheap, clean sunlight from midday to higher priced evenings is not a benefit, because that would happen with separate installations anyway.

This work is part of my masters thesis, which is written up more formally [here](../masters-thesis).