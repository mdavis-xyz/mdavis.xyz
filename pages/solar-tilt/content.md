Maximizing solar energy volume is the wrong goal. We should maximize value.

I've been thinking a lot recently about vertical solar. Mounting solar panels vertically can give some engineering benefits, however I think these aspects pale in comparison to the value that comes from shifting when a solar panel produces power to when consumers need it. 

For a fixed-tilt system, conventional wisdom is to mount a panel at an angle equal to the latitude, and pointed north/south (towards the equator). If you face it more to the west and more vertically, you reduce the total volume of energy produced, but can increase the total value, by capturing more of the evening spot price peak. You also produce more during winter, when solar power is more scarce.

I've run some simulations on NEM data for 2024, considering every possible orientation of fixed-tilt solar panels (horizontal to vertical, and N/S/E/W). The orientation that maximizes revenue is roughly halfway between the one that maximizes volume (conventional wisdom) and the one which maximizes capture price. In Queensland a panel's spot revenue can be almost doubled by pointing it more vertically, and more westward. That's a huge increase in value to society. 
The causation is simple. As more and more solar is installed and generating at midday, the value of each additional panel producing at midday keeps dropping, whilst generation during the late afternoon becomes more scarce.
I haven't done the calculations yet, but I expect the difference in marginal emissions abatement to be even larger than doubling.

![Graph of revenue vs panel tilt](REVENUE.png)


Despite these huge differences, rooftop solar around the world is typically rewarded with flat rates per kWh, or per kW, so home owners maximize volume, and society loses up to half of the panels' value. For my masters thesis I am looking at how we can improve subsidy design to address this.

Most large-scale farms use single-axis tracking. As panel prices continue to drop relative to tracking systems, I expect fixed-tilt panels will become more popular (especially fully-vertical bifacial panels). I wonder how many PPA negotiations discuss setting the orientation to maximize volume (best for the owner, for a given PPA price) vs maximizing revenue (best for the offtaker,  which should lead them to offer a higher PPA price).

These are pretty rough simulations, only using the trigonometry of the sun position. I've neglected diffuse light, weather and some atmospheric effects. Given how substantial the results are in the simplified model, I expect the overall story would remain the same with more sophisticated modelling.

The code for the simulations is available [on GitLab](https://gitlab.com/MatthewDavis/solar-tilt#).
This work is part of my masters thesis, which is ongoing at the time of writing.
