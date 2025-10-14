#import "@preview/cetz:0.4.0"
#import "@preview/cetz-plot:0.1.2"

#let MidPower = 0.4


#cetz.canvas(length: 1.8cm, {
  import cetz.draw: *
  import cetz-plot: *

    plot.plot(
      size: (5.5,3), 
      x-tick-step: 1, 
      x-label: "Time",
      y-label: "Power",
      x-max: 6.5,
      y-max: 1,
      y-min: 0,
      y-tick-step: none,
      y-ticks: ((0, [0%]), (MidPower, [40%]), (1, [100%]),), 
      axis-style: "school-book",
      //legend: ((T+1) / 2, 2), 
      legend: "south",
      {
        plot.add(
          (
            (1,1), (2,0), (3,MidPower), (4,1), (6,1),
          ), 
          line: (type: "hvh", mid: 1),
          // label: "Step",
        )
        plot.add(
          (
            (1,1), (2,1), (3,0), (4,MidPower), (5,1),
            (6,1),
          ), 
          line: (type: "linear", mid: 1),
          // label: "Diagonal",
        )
        // plot.add-hline(
        //   (
        //     1
        //   ),
        //   label: "Stay On",
        // )
        // plot.add(
        //   (
        //     (1,1), (2.3,1), (3,0), (3.3, 0), (4,MidPower), (4.3, MidPower), (5,1), (6, 1)
        //   ), 
        //   style: (stroke: purple),
        //   line: (type: "linear", mid: 1),
        //   label: "Linear (Reality)",
        // )
      }
    )
  
})
