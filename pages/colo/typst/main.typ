
== Motivation

"Colocation" refers to installing batteries and solar (or wind) together at the same site, as shown in @fig:colo-colo.
When examining the benefits of colocation, many investors, grid operators and policy makers choose a solar project without batteries as the counterfactual (@fig:colo-solar-only). Given the high upfront cost of batteries, a more suitable counterfactual is that of solar and batteries installed at separate locations, possibly by separate firms (@fig:colo-separate).
From this perspective, there are many practical benefits of battery colocation. For example:

- Only one network connection is needed. This matters because grid connections are often scarce, and costly to acquire @ZhaoWindColo.
- Network charges, charges for ancillary services, and dispatch target deviations due to weather forecast errors can be improved through co-optimising @YangWindColoForecast @ma2019optimal.
- There are efficiencies of scale for project management. e.g. Electricians only need to visit one site to maintain both panels and batteries.

Many researchers and industry participants conflate these benefits with the direct spot-revenue impact of charging a battery from solar. 
#cite(<NaemiWindColo>, form: "prose"),
#cite(<ZhaoWindColo>, form: "prose") and
#cite(<WongWindColoReview>, form: "prose") suggest that batteries help solar (or wind) generators store power when the sun is shining and prices are cheap, and discharge it later when prices are higher.
Whilst this 'solar sponge' approach does yield higher revenue than a solar farm without a battery, it also costs more to build. Conditional on buying a battery, it is not obvious whether colocation has any impact on spot revenue, compared to a solar farm and battery installed separately.


#subfigure(
  columns: (1fr, 1fr, 1fr),
  figure(
    image("figures/colo-diagrams/solar-only.svg", width: 95%),
    caption: [Solar Only]
  ), <fig:colo-solar-only>,
  figure(
    image("figures/colo-diagrams/together.svg", width: 95%),
    caption: [Battery and Solar Colocated]
  ), <fig:colo-colo>,
  figure(
    image("figures/colo-diagrams/separate.svg", width: 95%),
    caption: [Battery and Solar installed separately]
  ), <fig:colo-separate>,
  caption: [
    Visual explanation of colocation#footnote[
        Image components from
          // #link("https://thenounproject.com/icon/install-solar-panels-4596730/", "Rutmer Zijlstra"), // house with solar
          #link("https://thenounproject.com/icon/solar-panel-6877939/", "Larea"), // solar
          #link("https://thenounproject.com/icon/battery-2570294/", "Vectors Point") and // battery
          #link("https://thenounproject.com/icon/electric-meter-6785301/", "yode") // meter
          // #link("https://thenounproject.com/icon/house-7927379/", "White Snow") and // plain house
          // #link("https://thenounproject.com/icon/transmission-tower-2389567/", "Vectors Point") // tower
          via #link("https://thenounproject.com/", "The Noun Project") (CC BY 3.0)
    ].
      It is often claimed that colocation (b) yields higher revenue than (a).
      Since batteries are expensive, a more suitable comparison is (b) and (c)
  ] 
) <fig:colo-trio>

As an example, a common argument is that when spot prices go negative (or below zero minus the subsidy price) a colocated project can charge the battery for free using on-site solar generation, without wasting that sunlight or paying to export. However, in such a situation it would be more profitable to withhold the solar generation (waste sunlight) and get paid to charge from the grid at the negative price. This is exactly how separate batteries and solar would behave (either if owned by the same firm, or separate firms). Therefore I argue that time-shifting renewable power to increase revenue (or decrease emissions) is not a valid argument in favour of colocation.

The purpose of this section is to extend the model in 
//@sec:simple-solar-model 
@sec:solar-tilt
to investigate the impact of colocation on spot market revenue.
The angle at which solar panels are installed at is an investment decision, and the charging schedule of the battery is an operational decision. 
I will investigate whether colocating batteries with solar changes the optimal angle which panels should be installed at, the optimal battery charging revenue, or total spot market revenue.
The logistical considerations mentioned above will be neglected for this model.
// In particular, it is assumed that the grid connections is strong enough to accept the maximum power flow from the site.
Only spot revenue will be considered.
Upfront investment costs will be neglected, since they would be the same with both colocation and separate sites.
It is assumed that the grid connection is not constrained.
This extension applies to large scale projects, because I assume revenue is based on spot price.
For households with solar and a battery, the same principles would apply, were they not distorted by fixed tariffs.


== Solar With a Battery Which Can Charge From the Grid

I now extend the model shown in @tab:model-setup, @sec:simple-solar-model on #ref(<tab:model-setup>, form: "page").
Suppose that a battery is installed with the solar panels.
Now the operator faces the choice of whether to immediately export solar power when it is generated, or store it for later.

The battery is sized such that its depth (duration) is one time interval, and maximum charge and discharge is normalised to 1, which is the same as the size of the solar panels. i.e. when the solar panels are producing at their maximum, the battery will charge from completely empty to completely full in exactly one interval. //After that, it may only discharge.
I assume there are no subsidies.
//The revenue from discharging a battery which was charged from solar is the same as when discharging the same amount at the same time with energy which was sourced from the brown grid.
For now, I assume that the battery could also be charged from the grid. If the solar panel is producing $0 <= s_t <= 1$ the battery may take $s_t$ from the solar panel, and up to $1 - s_t$ from the grid, to charge up to its maximum of $1$.
  // - Alternatively, the solar could be fully exported to the grid, and simultaneously the battery may discharge to the grid, supplying up to $1 + s_t$ to the grid.

Now the firm has two sets of decisions to makes:

/ Ex ante\:: whether to position the solar panel horizontally or vertically; and
/ Ex post\:: when to charge and discharge the battery. Equivalently, whether to immediately export solar, or store it for later.

The sequence of events  is:

- Prices are known in advance.
- The owner chooses whether to install the solar panel horizontally or vertically.
- The battery starts completely empty.
- $T_1$: 
  - the solar produces 1 if horizontal or 0 if vertical
  - the battery can be charged from the grid and/or from the solar (if any)
- $T_2$:
  - the solar produces 0 if horizontal or $delta$ if vertical
  - the battery can be charged from the grid and/or from the solar (if any), or can discharge (if not empty)
- $T_3$: Solar produces 0. The battery may be discharged into (or charged from) the grid

Assume the battery has a round-trip efficiency of $0 < gamma < 1$. i.e. if charged until full (consuming 1 unit of energy) it will later provide $gamma$ units when discharged until empty.

I proceed with backwards induction.
Since $p_3 > 0$, the optimal plan is to discharge whatever power remains at the start of the final period.
Proceeding backwards to $T_2$, suppose the firm chose to install the panels horizontally. The operational decision regarding when to charge and discharge becomes either:

/ Store solar\:: Use all the solar power in $T_1$ to charge the battery to full, then discharge in the last (highest priced) period, earning revenue of $gamma p_3$
/ Export solar immediately then stop\:: Export solar to the grid as soon as it is generated ($T_1$), to earn $p_1$ of revenue. No solar is able to be generated in subsequent periods. Choose to not charge from the grid at all. Do not use the battery.
/ Export solar immediately then arbitrage\:: Export solar to the grid as soon as it is generated ($T_1$), to earn $p_1$ of revenue. In $T_2$ and $T_3$, do battery-only arbitrage. i.e. Charge from the grid in $T_2$ and discharge in $T_3$, yielding $gamma p_3 - p_2$ in additional revenue (only worthwhile if $gamma p_3 > p_2$). Thus the total revenue is $p_1 - p_2 + gamma p_3$.


// #table(
//   columns: 3,
//   align: horizon,
//   stroke: none,
// [Strategy],
// [Profit],
// [Optimal When],
// [store solar],
// [$gamma p_3$],
// [$gamma p_3 >= p_1$],
// [export solar immediately, then stop],
// [$p_1$],
// [$gamma p_3 <= p_1$],
// [export solar immediately, then arbitrage from $T_2$ to $T_3$],
// [$p_1 - p_2 + gamma p_3$],
// [never],
// )

// Therefore the maximised revenue will be:

// $
// pi_(h b) &= max cases(
//   gamma p_3 &  "(store solar)", 
//   p_1 & "(export solar immediately then stop)",
//   p_1 - p_2 + gamma p_3 &  "(export solar immediately then arbitrage)",
// )  \
// &= cases(
//   gamma p_3 & "if"  gamma p_3 > p_1 &  "(store solar)",
//   p_1 & "otherwise" & "(export solar immediately then stop)",
// ) 
// $


// Since the problem is a linear optimisation problem, interior solutions which are a linear combination of these  options cannot be the optimum.
The optimal charge schedule is to store solar power and discharge later during high prices, if the price increase is large enough to outweigh the round-trip storage losses. Otherwise, the best choice is to immediately export solar, and then do nothing. (Battery-only arbitrage in periods 2 and 3 is not profitable unless it is even more profitable to store from the solar panel.)
Note that this matches whether and when a standalone battery without solar would be charged to do arbitrage from the grid.

If instead the solar panels were installed vertically, the charge decision is between:

/ Charge from solar, without additional arbitrage\::
  In $T_2$, store the $delta$ of solar energy that is generated.
  Discharge in $T_3$ to export this, yielding $delta gamma p_3$ in revenue.

/ Charge from solar, with additional arbitrage\::
  Since $delta < 1$, the battery is not filled up by the solar output. So we can fill up the remaining capacity by charging from the grid in the prior period. (We could instead charge from the grid in $T_2$, but that charge would cost more because $p_2 > p_1$.)
  Thus we charge $1-delta$ from the grid in $T_1$ at a cost of $(1-delta) p_1$, charge $delta$ from solar in $T_2$, and discharge $gamma$ (i.e. 1 minus round trip storage losses) in $T_3$, giving $gamma p_3$ in discharge revenue. Total profit is $gamma p_3 - (1 - delta) p_1$

/ Immediately export solar, without additional arbitrage\::
  Export all the solar produced in $T_2$, giving $delta p_2$ in revenue. Do not charge or discharge the battery.
  
/ Immediately export solar, with additional arbitrage\::
  Export all the solar produced in $T_2$, when we produce it, earning $delta p_2$ in revenue. //Charge the battery fully from the grid in $T_1$, and discharge in $T_3$, to perform arbitrage between periods.
  Charge the battery fully from the grid in $T_1$, at a cost of $1 times p_1$. Store it through $T_2$ until $T_3$. Discharge fully in $T_3$ to receive $gamma p_3$ in revenue, giving $- p_1 + delta p_2 + gamma p_3$ in profit.
  

#block(breakable: false, [
  
The revenue is:

$
pi 
// &= cases(
//   delta gamma p_3 & "(charge from solar, without additional arbitrage)", 
//   gamma p_3 - (1 - delta) p_1 & "(charge from solar, with additional arbitrage)", 
//   delta p_2 & "(immediately export solar, without additional arbitrage)", 
//   - p_1 + delta p_2 + gamma p_3 & "(immediately export solar, with additional arbitrage)"
// ) \
&= cases(
  delta gamma p_3 & "(charge from solar, without additional arbitrage) Never Optimal", 
   - p_1 + delta p_1 + gamma p_3 & "(charge from solar, with additional arbitrage) Never Optimal", 
  delta p_2 & "(immediately export solar, without additional arbitrage)", 
  - p_1 + delta p_2 + gamma p_3 & "(immediately export solar, with additional arbitrage)"
) 
// &= cases(
//   cancel(delta gamma p_3) & cancel("(charge from solar, without additional arbitrage)") "Never Optimal", 
//    cancel(- p_1 + delta p_1 + gamma p_3) & cancel("(charge from solar, with additional arbitrage)") "  Never Optimal", 
//   delta p_2 & "(immediately export solar, without additional arbitrage)", 
//   - p_1 + delta p_2 + gamma p_3 & "(immediately export solar, with additional arbitrage)"
// ) 
// \
// &= cases(
//   delta gamma p_3 & "(charge from solar, without additional arbitrage)", 
//   delta p_2 & "(immediately export solar, without additional arbitrage)", 
//   - p_1 + delta p_2 + gamma p_3 & "(immediately export solar, with additional arbitrage)"
// ) 
$
])


It is not worth charging the battery with solar power if the prices vary too little for the arbitrage to cover the storage losses ($gamma p_3 < p_2$). When that is not the case ($gamma p_3 > p_2$) it is _still_ not optimal to charge the battery with solar power, because even greater profit can be obtained by immediately exporting the solar in $T_2$, and using the battery to capture a larger price difference ($p_3 - p_1 > p_3 - p_2$) from $T_1$ to $T_3$ with energy from the grid#footnote[This is true even if the battery is smaller in size, to match the maximum vertical solar output $delta$.].
This is a *key takeaway* of this model. 
@fig:charge-time shows the difference between the two strategies.
There is value in a 'solar sponge' battery which stores solar power when the sun is bright, and discharges it later when prices are high and the sunlight is low, when compared to not being able to store the power, and ignoring the sunk cost of the battery. However, this is not strictly better than charging from the grid using even cheaper power (which may be solar power from a neighbour, instead of one's own solar).
In simpler terms, moving a battery and solar farm together, such that charging from solar is no longer an explicit expense, does not eliminate the opportunities and opportunity costs of supplying and consuming from the spot market.


// @tab:revenue-cases-import combines the revenue for different prices. 
A vertical panel gives higher profit than a horizontal panel if and only if $delta p_2 >= p_1$. This is the same condition as when deciding the optimal tilt for solar without a battery. Thus, the solar tilt decision, and battery charge decisions are separable.
*Colocation of batteries and solar does not provide any new opportunities in the spot market, compared to separate battery and solar projects.* (Distortive household tariffs or subsidies may change this.)

#figure(
  include("figures/charge-time.typ"),
  caption: [
    Charging strategies for a battery and vertical solar panel.
    On the left is what happens when the battery is charged from the solar power in $T_2$ (with the remaining battery capacity charged from the grid in $T_1$).
    On the right is what happens when the solar power is immediately exported in $T_2$, and the battery arbitrages power from the grid by charging fully from the grid in $T_1$ and discharging in $T_2$. Charging from the grid (on the right) yields higher revenue than charging from solar (left). 
  ]
)<fig:charge-time>




// #figure(
//   include("tables/cases.typ"),
//   caption: "Revenue for each panel tilt, for different price schedules, when the battery can also charge from the grid"
// )<tab:revenue-cases-import>


== Solar With a Battery Which Cannot Charge From the Grid

In practice, many colocated 'solar with battery' projects are configured such that the battery can only be charged from the solar panels, never from the grid.
This may be due to engineering reasons, or regulatory reasons.
Now the choice of the firm  becomes:

/ Ex ante\:: Choose whether to install the panels vertically or horizontally; and
/ Ex post\:: Choose whether to immediately export solar when it is generated, or use all of it to charge the battery. (Interior solutions cannot be optimal.)

// If the battery is charged, the firm must choose when to discharge it.
Conditional on charging, the optimal discharge decision is to wait until the last period, because that is when the price is the highest.

For a horizontally positioned solar panel, the choice is:

- Use the 1 unit of solar production in $T_1$ to charge the battery. Discharge the battery (less the losses) to earn $gamma p_3$ in $T_3$; or
- Immediately export all solar generation in $T_1$, to earn $p_1$. The battery is not able to charge from the grid in subsequent periods. 

Both cases yield equivalent outcomes to having a solar panel and battery installed and operated separately.
The battery should be charged if and only if $gamma p_3 > p_1$. (i.e. if price increase is enough to overcome the storage round trip loss.)

For a vertically positioned solar panel, the choice is:

- Immediately export $delta$ units of power in $T_2$, earning $delta p_2$. Do not use the battery.
- Charge the battery with $delta$ of solar power in $T_3$. Even though it is not full, the remainder cannot be filled from the grid. Discharge it in $T_3$ to give $delta gamma p_3$ in revenue.


Note that in the case where $gamma p_3 > p_1$, the outcome is strictly worse than if the battery could be charged from the grid (or equivalently, if the battery was installed at a separate site, which could be charged from the grid).
This is similar to @fig:charge-time, except the inability to charge from the grid means the more profitable situation on the right is not possible, and on the left the small arbitrage of grid power from $T_1$ to $T_3$ is also not possible.
Another example, beyond this 3 period model, is that if a battery cannot charge from the grid, then it cannot earn revenue by arbitraging power within the time between sunset and sunrise.
If firms are able to pay more in engineering or regulatory costs to allow the battery to be charged from the grid as well as from solar, then for a sharp enough daily price curve it may be worth it to do so. This would require an explicit cost-benefit analysis. Anecdotally, recognition of the spot revenue benefit of being able to charge from the grid is lacking in the industry.

// #figure(
//   include("tables/cases-no-import.typ"),
//   caption: [Revenue for each panel tilt, for different price schedules, when the battery cannot charge from the grid]
// )



== Model Implications

// - With only solar, and no batteries, the optimal panel position is vertical (instead of horizontal) if and only if $delta p_2 >= p_1$.
// - With batteries and no solar, the optimal charge schedule is:
//   - charge in $T_1$ and discharge in $T_3$, earning $gamma p_3 - p_1$, if prices vary enough to outweigh the round trip losses ($gamma p_3 >= p_1$); else
//   - do nothing

- When the battery can charge from the grid, the optimal charge/discharge plan is identical to if a firm had a battery and solar project separately. // The only coupling arises from the finite depth of the battery. i.e. if the battery is charged from solar, that may preclude additional charging from the grid (before, during or after), because the battery is/will be full. In this case colocation yields _lower_ spot revenue than separate installations.
- If the batteries can also charge from the grid, then it is optimal for the solar to be vertical if and only if it is optimal for solar on its own to be vertical.
- If the battery cannot also charge from the grid, then the optimal tilt of the solar panels may be horizontal in cases when the optimal tilt of solar on its own is vertical. The intuition of this coupling is that the constraint preventing the battery from charging from the grid limits arbitrage opportunities (making the firm worse off). Keeping the solar panels horizontal instead of vertical shifts the potential charging time earlier. This yields a larger duration, and thus larger price difference for temporal arbitrage with the battery.

Contrary to popular opinion, colocating batteries and solar on the same site compared to different sites provides no improvement or even a reduction in spot market revenue.
For colocated projects, preventing the battery from charging from the grid reduces the set of possible arbitrage strategies.
