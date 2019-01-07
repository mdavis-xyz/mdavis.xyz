<video autoplay loop class="video" class="appear">
   <source src="video.mp4" type="video/mp4" width=1500 height=500>
</video>

This project is a combination of two of my passions: programming and unicycling.
I used the [Keras reinforcement learning library](https://github.com/keras-rl/keras-rl) to train a machine learning model how to ride a unicycle.
I published the code in [this GitHub repo](https://github.com/mlda065/keras-unicycle).

## Overall Structure

This project uses the [Gym](https://gym.openai.com/) library.
This library is designed to provide a common interface between different machine learning models (the controller), and physical models of the thing being controlled (the plant).

The controller is a [Keras-rl](https://github.com/keras-rl/keras-rl) model, which uses a TensorFlow backend.

Each *frame* Gym tells my Keras model the current state of the unicycle.
The Keras model makes a decision (push on the left pedal or right).
This is fed into the model, which updates the state for the next *frame*.
This new state, and is fed back into Keras, in addition to a reward to tell Keras how well it's doing.



## Physics

Unicycles are a type of [inverted pendulum](https://en.wikipedia.org/wiki/Inverted_pendulum).
These problems are well suited to machine learning.
(Yes, this can be solved with traditional PID controllers and fuzzy logic. I chose machine learning as something fun and educational.)

The physics engine used is a [simple custom script](https://github.com/mlda065/keras-unicycle/blob/3f6d682d527f50dfd98bf9b108e53b79e37cdc6c/gym-unicycle/gym_unicycle/envs/unicycle_env.py#L157) which evaluates the inverted pendulum problem.
It is a modified version of the [CartPole-V0](https://gym.openai.com/envs/CartPole-v0/) environment from the gym library.

Unicycling is a lot like balancing a pencil on your finger.
If the pencil starts to fall forwards, you accelerate your finger forwards.
However unlike pencil balancing, this project is only in 1 dimension.

There are 4 states:

* horizontal position of the wheel
* horizontal speed of the wheel
* angular position of the seat-post
* angular velocity of the seat post

There is 1 input. The options are:

0. push on the left pedal - hard
1. push on the left pedal - medium
2. push on the left pedal - soft
3. don't push on either pedal
4. push on the right pedal - soft
5. push on the right pedal - medium
6. push on the right pedal - hard

## Machine Learning

The layers of the neural network are published [here](https://github.com/mlda065/keras-unicycle/blob/3f6d682d527f50dfd98bf9b108e53b79e37cdc6c/main.py#L58).

The environment code for the model normalises all the states so that they range from -1 to 1.
This is because neural networks perform best when the inputs are the same order of magnitude.

The horizontal position of the unicycle is fed in as 3 separate variables.
There is the total rotation of the wheel from the centre position.
Additionally there is the sine and cosine of the wheel rotation.
This is because the physical model is inherently trigonometric.
Pushing down on horizontal pedals results in more torque than when the pedals are diagonal or vertical.
Rather than force the neural network to figure out this relationship, I guided it by calculating the sine and cosine for it.

The reward function contains several components.
The [Keras-rl CartPole-V0 example](https://raw.githubusercontent.com/keras-rl/keras-rl/master/assets/cartpole.gif) simply returns 1 for each frame the pole hasn't fallen over.
Because the unicycle model is more complicated, I found this wasn't sufficient.
So I added more components to the reward function to help guide it towards success:

* 3 points for every frame the unicycle stays within the limits. (It hasn't fallen over, gone off screen, nor exceeded speed limits.) This is because the goal is to simply survive. The longer the machine keeps the unicycle upright, the more points it gets.
* A reward of up to 1 based on how close the unicycle is to the centre. Without this the computer often keeps the unicycle near the window edge, where it is likely to run off the screen (which is a failure). This reward is a parabola, with a value of 1 at the centre of the screen, and 0 at the edges.
* A penalty of up to 0.2 based on how far the seat post is from vertical. (A human unicyclist is more likely to fall over if they lean very far forward or back.)
* A penalty of up to 0.2 points if the horizontal speed is too high. (A human unicyclist is more likely to fall over if they move extremely fast.) This penalty only kicks in above a certain speed threshold. The higher the speed (above this threshold) the larger the penalty.
* Similarly, a penalty of up to 0.2 if the seat post is falling too fast. This penalty does not apply if the seat post is moving back towards vertical very quickly.
* A penalty of up to 1.0 based on how different each action is to the last. This is to tempt the controller to add a bit of smoothness and hysteresis. Without it, the controller tends to oscillate wildly between pressing hard on the left pedal one frame, then hard on the right pedal, then hard on the left pedal. Any real physical actuator would struggle with that. This penalty slows down that oscillation.
* Similarly, a penalty of up to 0.2 if the controller chooses one action repeatedly for less than 0.3 seconds.

## Discussion

There is a lot of unsubstantiated hype about what machine learning can do, including the misnomer of "artificial intelligence".
As technologists it's our job to ensure normal people don't get carried away with the hype.

One reason machine learning is well suited to unicycling is because it has a small action space, completely deterministic, and easily assessable.
Anyone can tell you whether a unicyclist fell over or not.
As a counter-example, using machine learning to flag terrorist propaganda or copyright infringement on the web is *never* going to be good, because humans can't agree on what counts and what doesn't. ([example](https://www.nytimes.com/2016/09/10/technology/facebook-vietnam-war-photo-nudity.html), [example](https://theweek.com/articles/497091/australias-small-breast-ban), [example](https://en.wikipedia.org/wiki/Legal_status_of_drawn_pornography_depicting_minors))
How could we possibly train a computer to classify things based on categories we can't agree on?
There are some problems which can't be solved by machine learning.
Trying to throw machine learning at everything results in [war criminals escaping punishment](https://theintercept.com/2017/11/02/war-crimes-youtube-facebook-syria-rohingya/), and criminals being imprisoned for longer just [because they're from a poor postcode](https://www.wired.com/2017/04/courts-using-ai-sentence-criminals-must-stop-now/).
Another example of a problem which is foolishly being 'solved' by machine learning is [adding people to the no-fly list based on postcode](https://theintercept.com/2018/12/03/air-travel-surveillance-homeland-security/).

Machine learning is useful for some problems. Not all. Throwing CPUs and data at a problem isn't a guarantee for success.
