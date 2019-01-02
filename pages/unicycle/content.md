This project is a combination of two of my passions: programming and unicycling.
I used the [Keras reinforcement learning library](https://github.com/keras-rl/keras-rl) to train a machine learning model how to ride a unicycle.
I published the code in [this Github repo](https://github.com/mlda065/keras-unicycle).

Unicycles are a type of [inverted pendulum](https://en.wikipedia.org/wiki/Inverted_pendulum).
These problems are well suited to machine learning.
(Yes, this can be solved with traditional PID controllers and fuzzy logic. I chose machine learning as something fun and educational.)

There is a lot of unsubstantiated hype about what machine learning can do, including the misnomer of "artificial intelligence".
As technologists it's our job to make sure normal people don't get carried away with the hype.

One reason machine learning is well suited to unicycling is because it's a small action space, completely deterministic, and easily assessable.
Anyone can tell you whether a unicyclist fell over or not.
As a counter-example, using machine learning to flag terrorist propaganda or copyright infringement on the web is *never* going to be good, because humans can't agree on what counts and what doesn't. ([example](https://www.nytimes.com/2016/09/10/technology/facebook-vietnam-war-photo-nudity.html), [example](https://theweek.com/articles/497091/australias-small-breast-ban), [example](https://en.wikipedia.org/wiki/Legal_status_of_drawn_pornography_depicting_minors))
How could we possibly train a computer to classify things based on categories we can't agree on?
There are some problems which can't be solved by machine learning.
Trying to throw machine learning at everything results in [war criminals escaping punishment](https://theintercept.com/2017/11/02/war-crimes-youtube-facebook-syria-rohingya/), and criminals being imprisoned for longer just [because they're from a poor postcode](https://www.wired.com/2017/04/courts-using-ai-sentence-criminals-must-stop-now/).
Another example of a problem which is foolishly being 'solved' by machine learning is [adding people to the no-fly list based on postcode](https://theintercept.com/2018/12/03/air-travel-surveillance-homeland-security/).

Machine learning is useful for some problems. Not all. Throwing CPUs and data at a problem isn't a guarantee for success.
