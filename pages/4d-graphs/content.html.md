This document outlines a method for visualising four-dimensional
complex-to-complex functions in only 3 dimensions. It cannot be
generalised to other four-dimensional objects. (For that, check out
[Miegakure](http://miegakure.com/))

These visualisations do not show the true beauty of four-dimensions.
However they can be used to:

-   give geometrical meaning to differentiability;
-   show an immensely deep relationship between trig functions and
    hyperbolic trig functions;
-   give meaning to the [2*πi*]{.formula} periodicity of the exponential
    function; and
-   clearly show how branch cuts affect the Log function.

An interactive version of this document for Maple can be found
[here](mapleFile.zip).

Two-Dimensional Analogy
-----------------------

First, we will visualise a real-to-complex functions in 2D.

::: {.formula}
*f*(*x*) = *e*^*ix*^ = cos(*x*) + *i*sin(*x*)

<div>

*f*:[ℜ → ℂ]{.blackboard}

</div>
:::

The real part of [*f*(*x*)]{.formula} is [cos(*x*)]{.formula} which
looks like this:

![graph](images/cosReal.png){.graph width="400" height="400"}

The imaginary part of [*f*(*x*)]{.formula} is [sin(*x*)]{.formula} which
looks like this:

![graph](images/sinReal.png){.graph width="400" height="400"}

Now we superimpose both curves on the same axes, using colour to help us
remember which is which.

![graph](images/exp2D.png){.graph width="400" height="400"}

Now we have a 2D graph of a real-to-complex function. To look up
[*f*(*x*)]{.formula} on the graph, imagine a vertical line at
[*x*]{.formula}. The line will intersect the red and blue curves exactly
once each. The height of the points of intersection of the red and blue
curves equals the value of the imaginary and real parts of
[*f*(*x*)]{.formula} respectively.

All 3 Dimensions
----------------

### Cartesian Graphs {#cartesian-graphs .Subsection-}

The next step is to add an axis out of the page, which represents
[ℑ(*x*)]{.formula} (the imaginary component of [x]{.formula}), what is
currently the [*x*]{.formula} axis becomes the [ℜ(*x*)]{.formula} axis.
(The real component of [x]{.formula}.) I will call the vertical axis the
[*z*]{.formula} axis.

Let\'s look at a function similar to the previous example, but with a
complex domain (and without the [*i*]{.formula} in the power).

::: {.formula}
*g*(*z*) = *e*^*z*^ = *e*^*x* + *iy*^ = *e*^*x*^[(]{.symbol}cos(*y*) + *i*sin(*y*)[)]{.symbol}
*g*:[ℂ → ℂ]{.blackboard}
:::

We\'ll start by plotting the real part as a complex to real function.
You can visualise this in the same way as a function of 2 variables in
the real world.

::: {.formula}
ℜ[(]{.symbol}*g*(*z*)[)]{.symbol} = *e*^*x*^cos(*y*)
:::

![graph](images/expReal.png){.graph width="400" height="400"}

Now we plot the imaginary part, which can also be thought of as a
complex to real function, or a 2 variable real function.

::: {.formula}
ℑ[(]{.symbol}*g*(*z*)[)]{.symbol} = *e*^*x*^sin(*y*)
:::

![graph](images/expIm.png){.graph width="400" height="400"}

Now we superimpose both graphs on the same axes.

Maple won\'t let me add a legend to 3D graphs, so remember, the blue
surface is the real component and the red surface is the imaginary
component.

![graph](images/expBoth.png){.graph width="400" height="400"}

To look up [*g*(*z*)]{.formula} on the graph, imagine a vertical line
through [[(]{.symbol}*x*, *y*[)]{.symbol}]{.formula}. The line will
intersect the red and blue surfaces exactly once each. The height of the
points of intersection of the red and blue surfaces equals the value of
the imaginary and real parts of [*g*(*z*)]{.formula} respectively. We
can now see geometrically what it means for the exponential function to
have a period of [2*πi*]{.formula} (it has a period of [2*π*]{.formula}
along the y axis).

### Polar Graphs {#polar-graphs .Subsection-}

We already know [*g*(*z*) = *e*^*x*^*e*^*iy*^]{.formula}. That is, the
function has modulus [*e*^*x*^]{.formula} at an angle of
[*y*]{.formula}. We can see this more clearly by plotting the argument
and modulus instead of [ℜ[(]{.symbol}*g*(*z*)[)]{.symbol}]{.formula} and
[ℑ[(]{.symbol}*g*(*z*)[)]{.symbol}]{.formula}.

![graph](images/polarExp.png){.graph width="400" height="400"}

From this graph we see that the argument (green) is independent of
[*x*]{.formula}, and increases linearly as y increases (the saw-tooth
appearance is because any value above [*π*]{.formula} gets wrapped
around back into the [ − *π*]{.formula} to [*π*]{.formula} range). We
can see that the modulus (orange) is just [*e*^*x*^]{.formula}. It is
clear from this that visualising complex-to-complex graphs can be
insightful. Obviously we still can\'t see the curve in all its 4D glory,
but there is a lot more usefulness to come.

Differentiability
-----------------

For this section we will stick to Cartesian graphs, because
differentiation is intrinsically Cartesian (due to the Cartesian nature
of the Cauchy-Riemann equations).

To explain what differentiability means geometrically, here is an
example:

::: {.formula}
*h*(*z*) = *x*^2^ + *iy*^2^*h*:[ℂ → ℂ]{.blackboard}
:::

If we apply the Cauchy-Riemann equations we get:

::: {.formula}
[[(]{.ignored}[∂*u*[(]{.symbol}*x*, *y*[)]{.symbol}]{.numerator}[)/(]{.ignored}[∂*x*]{.denominator}[)]{.ignored}]{.fraction} = [[(]{.ignored}[∂*v*[(]{.symbol}*x*, *y*[)]{.symbol}]{.numerator}[)/(]{.ignored}[∂*y*]{.denominator}[)]{.ignored}]{.fraction}
:::

::: {.formula}
2*x* = 2*y*
:::

::: {.formula}
*x* = *y*
:::

and

::: {.formula}
[[(]{.ignored}[∂*u*[(]{.symbol}*x*, *y*[)]{.symbol}]{.numerator}[)/(]{.ignored}[∂*y*]{.denominator}[)]{.ignored}]{.fraction} =  − [[(]{.ignored}[∂*v*[(]{.symbol}*x*, *y*[)]{.symbol}]{.numerator}[)/(]{.ignored}[∂*x*]{.denominator}[)]{.ignored}]{.fraction}
:::

::: {.formula}
0 = 0
:::

Therefore [*h*(*z*)]{.formula} is differentiable only where
[*x* = *y*]{.formula}. Let\'s see why this is by looking at the graph
geometrically. Here is a Cartesian graph of [*h*(*z*)]{.formula}:

![graph](images/parabolasSimple.png){.graph width="400" height="400"}

Let\'s pick an arbitrary point on [*x* = *y*]{.formula}, such as
[1 + *i*]{.formula}.

The tangent plane (gold) to the real surface (blue) at
[1 + *i*]{.formula} looks like:

![graph](images/realTangent.png){.graph width="400" height="400"}

The tangent plane (gold) to the imaginary surface (red) looks like:

![graph](images/imTangent.png){.graph width="400" height="400"}

We already know the graph is differentiable at [1 + *i*]{.formula}.

The first Cauchy-Riemann equation
[[[(]{.ignored}[∂*u*[(]{.symbol}*x*, *y*[)]{.symbol}]{.numerator}[)/(]{.ignored}[∂*x*]{.denominator}[)]{.ignored}]{.fraction} = [[(]{.ignored}[∂*v*[(]{.symbol}*x*, *y*[)]{.symbol}]{.numerator}[)/(]{.ignored}[∂*y*]{.denominator}[)]{.ignored}]{.fraction}]{.formula}
tells us that the slope of the tangent plane to the real surface in the
direction of the positive x axis is equal to the slope of the tangent
plane to the imaginary surface in the direction of the positive y axis.

The second Cauchy-Riemann equation
[[[(]{.ignored}[∂*u*[(]{.symbol}*x*, *y*[)]{.symbol}]{.numerator}[)/(]{.ignored}[∂*y*]{.denominator}[)]{.ignored}]{.fraction} =  − [[(]{.ignored}[∂*v*[(]{.symbol}*x*, *y*[)]{.symbol}]{.numerator}[)/(]{.ignored}[∂*x*]{.denominator}[)]{.ignored}]{.fraction}]{.formula}
tells us that the slope of the tangent plane to the real surface in the
direction of the positive y axis is equal to the slope of the tangent
plane to the imaginary surface in the direction of the negative x axis.

This means that the planes are actually identical, but they are rotated
[90^*o*^]{.formula} around the *z* axis relative to each other.

This rotational equality in tangent planes is the geometric meaning of
differentiability. It\'s hard to check whether such rotations are
possible at an arbitrary point in your head with visualisations (try
checking anywhere on [*y* =  − *x*]{.formula}, make sure you rotate in
the correct direction), but at least now you *know* the geometric
meaning of differentiability for complex-to-complex functions.

Logarithms
----------

### log {#log .Subsection-}

Let\'s look at logs.

::: {.formula}
log(*z*) = ln∣*z*∣ + *i*(*θ*) *θ* ∈ ℝ
:::

Let\'s plot this as before. The real part (blue) can be thought of in a
Cartesian sense, the imaginary part (red) can be thought of in a polar
sense (notice that I have defined the range of [*θ*]{.formula} to be any
real number, not just a [2*π*]{.formula} range).

![graph](images/log.png){.graph width="400" height="400"}

Notice that every possible vertical line intersects the red surface at
more than one point. This is because [log]{.formula} is a multi-valued
function. Notice that each such intersection is [2*π*]{.formula} above
or below the next. That\'s because the imaginary part of [log]{.formula}
is [*θ* + 2*kπ*]{.formula} for [*θ* ∈ ( − *π*, *π*\]]{.formula}. Each
layer of the red helix corresponds to a different value of
[*k*]{.formula}.

We can also see why [log(0)]{.formula} is indeterminate (the red surface
intersects the line [*x* = *y* = 0]{.formula} at every point).

### Log {#log-1 .Subsection-}

Now let\'s looks at Log[(*z*)]{.formula}.

We need to restrict this helix/spiral thing so that we have a
single-valued function. This is known as a \'branch cut\'. The following
graph shows how different branch cuts affect the Log function. The
variable [t]{.formula} is the angle of the branch cut, in radians.

Beyond
------

Now we know how to visualise arbitrary complex-to-complex functions in
only 3 dimensions. Let\'s try some more complicated ones to see what
happens.

::: {.formula}
*f*(*x* + *iy*) = [[(]{.ignored}[tan^ − 1^[(]{.symbol}*x* + *iy*[)]{.symbol}]{.numerator}[)/(]{.ignored}[*x* − *iy*]{.denominator}[)]{.ignored}]{.fraction}
*f*:[ℂ → ℂ]{.blackboard}
:::

![graph](images/random.png){.graph width="400" height="400"}

#### Polynomials {#polynomials .Subsubsection-}

Here is a complex parabola:

::: {.formula}
*f*[(]{.symbol}*z*[)]{.symbol} = *z*^2^ *f*:[ℂ → ℂ]{.blackboard}
:::

![graph](images/parabolaThing.png){.graph width="400" height="400"}

Here is a complex cubic:

::: {.formula}
*f*[(]{.symbol}*z*[)]{.symbol} = *z*^3^ *f*:[ℂ → ℂ]{.blackboard}
:::

![graph](images/cubicThing.png){.graph width="400" height="400"}

Here is a complex square root. (Note: Only the principle value of the
square root is shown)

::: {.formula}
*f*[(]{.symbol}*z*[)]{.symbol} = *z*^[[(]{.ignored}[1]{.numerator}[)/(]{.ignored}[2]{.denominator}[)]{.ignored}]{.fraction}^
*f*:[ℂ → ℂ]{.blackboard}
:::

![graph](images/squareRootThing.png){.graph width="400" height="400"}

Here is a complex hyperbola:

::: {.formula}
*f*[(]{.symbol}*z*[)]{.symbol} = *z*^ − 1^ *f*:[ℂ → ℂ]{.blackboard}
:::

![graph](images/hyperbolaThing.png){.graph width="400" height="400"}

### Trigonometry {#trigonometry .Subsection-}

Here is [cos(*z*)]{.formula}:

::: {.formula}
*f*[(]{.symbol}*z*[)]{.symbol} = cos(*z*) *f*:[ℂ → ℂ]{.blackboard}
:::

![graph](images/complexCos.png){.graph width="400" height="400"}

Now here is [cosh(*z*)]{.formula}:

::: {.formula}
*f*[(]{.symbol}*z*[)]{.symbol} = cosh(*z*) *f*:[ℂ → ℂ]{.blackboard}
:::

![graph](images/complexCosh.png){.graph width="400" height="400"}

Notice that they are identical aside from a [90^*o*^]{.formula} rotation
about the z axis? That\'s because
[cos[(]{.symbol}*iz*[)]{.symbol} = cosh(*z*)]{.formula}, and
multiplication by [*i*]{.formula} results in a rotation of
[90^*o*^]{.formula} (rotation in either direction because they are both
even functions in the real world). Is your mind blown?

Your Turn
---------

If you want to graph any other functions, first open up Maple, and type
in the following code.

    ImColour:=red;
    ReColour:=blue;
    with(plots):
    plotIm:=(func,x1,x2,y1,y2)->plot3d(Im(func(x,y)),x=x1..x2, y=y1.. y2, color=ImColour, axes=boxed);
    plotRe:=(func,x1,x2,y1,y2)->plot3d(Re(func(x,y)),x=x1..x2, y=y1.. y2, color=ReColour, axes=boxed);
    plotComplex:=(func,x1,x2,y1,y2)->display3d({plotIm(func,x1,x2,y1, y2),plotRe(func,x1,x2,y1,y2)});

Then type in the following code, and replace
[\<function\>]{.inline-code} with the function you want to graph in
terms of [*x*]{.formula} and [*y*]{.formula} (e.g. just "sin(x+I\*y)",
no "f(x)"). [*x*~1~]{.formula}, [*x*~2~]{.formula}, [*y*~1~]{.formula}
and [*y*~2~]{.formula} are the ranges to be graphed. Replace them with
real numbers such that [*x*~1~ \< *x*~2~]{.formula} and
[*y*~1~ \< *y*~2~]{.formula}. Don\'t forget that in Maple
[[[√]{.radical}[(]{.ignored}[ − 1]{.root}[)]{.ignored}]{.sqrt} is
written with a capital \`I\', not a lower case one.]{.formula}

If you want to try a few functions, it is only necessary to retype this
last line.

    plotComplex((x,y)-><function>,x1,x2,y1,y2);

Go have a play. There is a lot to discover.
