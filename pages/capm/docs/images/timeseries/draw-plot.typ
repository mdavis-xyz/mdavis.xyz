#import "@preview/cetz:0.4.0": canvas, draw
#import "@preview/cetz-plot:0.1.2": plot

#set page(height: auto, width: auto, margin: 0.5cm)
#set align(right)



#let date-str = "2025/08/07"
#let data = csv("one-day.csv", row-type: dictionary)
// #let data = csv("PRICE_AND_DEMAND_202508_NSW1.csv", row-type: dictionary).filter(row => row.SETTLEMENTDATE.starts-with(date-str))

#let prices = data.map(row => float(row.RRP))

#let mean(arr) = {
  return arr.sum() / arr.len()
}

// standard deviation
// can pass pre-computed mean for efficiency reasons
#let std(arr, mean-val: none) = {
  if mean-val == none {
    return std(arr, mean-val: mean(arr))
  } else {
    return calc.sqrt(arr.map(x => calc.pow((x - mean-val), 2)).sum() / arr.len())
  }
}

// extract quantities
// then normalise them
#let q1 = data.map(row => float(row.TOTALDEMAND))
#let q1-mean = mean(q1)
#let original-quantities = q1.map(q => q / q1-mean)
#let shift-hours = 20
#let periods-per-hour = 12
#let hours-per-day = 12
#let periods-per-day = periods-per-hour * hours-per-day
#let shift-periods = shift-hours * periods-per-hour
#let shifted-quantities = original-quantities.slice(shift-periods) + original-quantities.slice(0, shift-periods)
#let hours = prices.enumerate().map(tp => tp.at(0) / hours-per-day)

#let y-tick-label(s) = {
  text(size: 10pt)[#s]
}

#let zip(a,b) = {
  assert(a.len() == b.len())
  let results = ()
  for (i, ax) in a.enumerate() {
    let bx = b.at(i)
    results.push((ax, bx))
  }
  return results
}

#let original-costs = ()
#let shifted-costs = ()

#for (t, p) in prices.enumerate() {
  original-costs.push(p * original-quantities.at(t) / periods-per-hour)
  shifted-costs.push(p * shifted-quantities.at(t) / periods-per-hour)
  
}


#let original-cost = original-costs.sum()
#let shifted-cost = shifted-costs.sum()

#let original-cost-mean = original-cost / original-costs.len()
#let shifted-cost-mean = shifted-cost / shifted-costs.len()

#let q-std = std(original-quantities)
#let original-cost-std = std(original-costs)
#let shifted-cost-std = std(shifted-costs)

#let max-costs = calc.ceil(calc.max(..(original-costs + shifted-costs)))

#let x-ticks = (6, 12, 18)

#let graph-width = 8
#let price-graph-height = 1.5
#let quantity-graph-height = 1.5
#let cost-graph-height = 3

#align(center)[
  #text(size: 20pt)[
    #if (shift-hours == 0) {
      [Original]
    } else {
      [Shifted]
    }
    
  ]
]

#canvas({
  import draw: *

  plot.plot(
    size: (graph-width, price-graph-height),
    axis-style: "school-book",
    legend: none,
    y-label: "Price ($/MWh)",
    x-label: "Hour",
    y-tick-step: 200,
    x-tick-step: none,
    x-ticks: x-ticks,
    {
      plot.add(zip(hours, prices))
    }
  )

})


// quantity
#canvas({
  import draw: *

  plot.plot(
    size: (graph-width, quantity-graph-height),
    axis-style: "school-book",
    legend: none,
    y-label: "Quantity",
    x-label: "Hour",
    y-tick-step: none,
    y-ticks: (1,),
    x-tick-step: none,
    x-ticks: x-ticks,
    {
      plot.add(zip(hours, shifted-quantities))
    }
  )

})
  
// cost
#canvas({
  import draw: *

  plot.plot(
    size: (graph-width, cost-graph-height),
    axis-style: "school-book",
    legend: none,
    y-max: max-costs,
    y-label: "Cost ($)",
    x-label: "Hour",
    y-tick-step: none,
    y-ticks: (
      (original-cost-mean, y-tick-label("Mean")),
      (original-cost-mean - original-cost-std, y-tick-label("Mean - Std")),
      (original-cost-mean + original-cost-std, y-tick-label("Mean + Std")),
    ),
    x-tick-step: none,
    x-ticks: x-ticks,
    {
      plot.add(zip(hours, shifted-costs))
    }
  )

})
  
  