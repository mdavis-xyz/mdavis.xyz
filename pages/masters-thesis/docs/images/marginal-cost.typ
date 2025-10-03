

#import "@preview/cetz:0.4.0": canvas, draw
#import "@preview/cetz-plot:0.1.2": plot
#import "@preview/dashy-todo:0.0.3": todo

#let is_draft = false

#let n_max = 8
#let n_min = 1

#let x_min = 1 / 2

#let y_scale = 0.15

// excluding the fixed cost
#let individual_cost(x) = y_scale / (1 - x)  - y_scale
#let individual_marginal_cost(x) = y_scale / ((1 - x) * (1 - x))


#let fixed_cost = 1

#let aggregate_cost(n, x) = n * fixed_cost + individual_cost(x / n)
#let aggregate_marginal_cost(n, x) = individual_marginal_cost(x / n) / n

//#let individual(n, x) = (n - 1) + 1 / (n  *  (n - x))

#let domain_start(n) = 0
#let domain_end(n) = n - 0.01
#let domain(n) = (domain_start(n), domain_end(n))

#let lowest_cost(x) = {
  let lowest_y = none
  let lowest_n = none

  for n in range(n_min, n_max){
    if (domain_start(n) <= x) and (x <= domain_end(n)) {
      let y = aggregate_cost(n, x)
      if (lowest_y == none) or (y < lowest_y) {
        lowest_y = y
        lowest_n = n
      }
    }

    if lowest_y != none {
      (y: lowest_y, n: lowest_n)
    } else {
      (y: 99999, n: none)
    }
    
  }
}

#let marginal_lowest_cost(x) = {
  let n = lowest_cost(x).n
  if n != none {
    aggregate_marginal_cost(n, x)
  } else{
    9999
  }
}


// perform a binary search
// until steps = 0
// assuming func(x) is increasing
// search for x such that func(x) == 0
#let binary_search(func, start, end, steps) = {
  let mid = (start + end) / 2.0
  if steps <= 0 {
    return mid
  } else {
    let y = func(mid)
    if y == 0 {
      return mid
    } else if y > 0 {
      // n is now more expensive than n + 1
      // too far, go back to the left
      return binary_search(func, start, mid, steps - 1)
    } else {
      // n is now cheaper than n - 1
      // keep moving to the right
      return binary_search(func, mid, end, steps - 1)
    }
  }
}

// find the x such that aggregate_cost(n, x) == aggregate_cost(n + 1, x)
// using a binary search
#let find_upper_crossover(n) = {
  let func = (x) => aggregate_cost(n, x) - aggregate_cost(n + 1, x)
  let iterations = if is_draft { 4 } else { 10 }
  let x = binary_search(func, domain_start(n), domain_end(n), iterations )
  return x
}


#let y_max = 6.8
#let x_max = 4.5


#let draw-level(length: 1cm) = {
  canvas(length: length, {
    import draw: *
  
    plot.plot(
      size: (6, 6),
      axis-style: "school-book",
      x-tick-step: 1,
      y-min: 0,
      y-max: y_max,
      x-min: 0,
      x-max: x_max,
      y-tick-step: 1,
      y-format: (y) => (if (y != 1) {str(y)} else {""}) + (if (y != 0) {"F"} else {""}),
      x-format: (y) => (if (y != 1) {str(y)} else {""}) + (if (y != 0) {"K"} else {""}),
      // y-format: plot.formats.multiple-of(1, symbol: none, suffix: "F"),
      //y-ticks: ((1, [A]),),
      x-grid: 1,
      legend: none,
      y-label: "Cost",
      x-label: [$Q_e$],
      {
        for n in range(n_min, n_max) {
          plot.add(
            (x) => aggregate_cost(n, x), 
            domain: domain(n),
            style: (stroke: (dash: "dashed", paint: blue)),
          )
  
  
          if n < x_max {
              plot.annotate({
                content((domain_end(n) , y_max + 0.5), [$C_(#n)(Q_e)$])
              })
          }
          
        }
  
        plot.add(
          (x) => lowest_cost(x).y,
          domain: (domain_start(n_min), domain_end(n_max)),
          style: (stroke: (paint: green)),
          samples: if is_draft { 50 } else { 200 },
        )
  
        plot.annotate({
          content((domain_end(calc.trunc(x_max)) , (calc.trunc(x_max) + 0.5) * fixed_cost), [$C_"agg" (Q_e)$])
        })
  
        
      }
    
    )
  })
}

#let draw-marginal(length: 1cm) = {
  canvas(length: length, {
    import draw: *
  
    let y_dash_max = 40 * y_scale
        
    plot.plot(
      size: (6, 6),
      axis-style: "school-book",
      x-tick-step: 1,
      y-min: 0,
      y-max: y_dash_max,
      x-min: 0,
      x-max: x_max,
      y-tick-step: none,
      y-ticks: ((1, [$F / K$]),),
      x-format: (y) => (if (y != 1) {str(y)} else {""}) + (if (y != 0) {"K"} else {""}),
      x-grid: 1,
      y-label: "Marginal \n Cost",
      x-label: [$Q_e$],
      legend: none,
      {
        for n in range(n_min, n_max) {
          plot.add(
            (x) => aggregate_marginal_cost(n, x), 
            domain: domain(n),
            style: (stroke: (dash: "dashed", paint: blue))
          )
  
          if n < x_max {
              plot.annotate({
                content((domain_end(n) , y_dash_max + 0.5), [$C'_(#n)(Q_e)$])
              })
          }
          
        }
  
  
        let bounds_cache = ("0": 0)
        for n in range(1, 6) {
          let start = bounds_cache.at(str(n - 1))
          let end = find_upper_crossover(n)
          bounds_cache.insert(str(n), end)
          assert(end > start, message: "n = " + str(n) + "start = " + str(start) + ", end = " + str(end))
          plot.add(
            (x) => aggregate_marginal_cost(n, x),
            domain: (start, end),
            style: (stroke: (paint: green)),
            samples: if is_draft { 10 } else { 100 }
          )
          
        }
  
  
        // all in one go
        // but we get vertical bars
        // plot.add(
        //     (x) => marginal_lowest_cost(x),
        //     domain: (domain_start(n_min), domain_end(n_max)),
        //     style: (stroke: (paint: green)),
        //     samples: 300
        //   )
  
        plot.annotate({
          content((x_max , marginal_lowest_cost(x_max) + y_dash_max * 0.1), [$C'_"agg" (Q_e)$], anchor: "north")
        })
  
        // plot.add-hline(fixed_cost, style: (stroke: (paint: orange)))
  
        
      }
    
    )
  })
}



#let gutter = 2cm
#set page(height: auto, margin: 8pt, width: 17cm)

#grid(
  columns: (6cm, 6cm),
  gutter: 2cm,
  draw-level(),
  draw-marginal()
)
