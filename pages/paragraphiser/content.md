
I wrote a bot to crawl [Reddit](reddit.com) and look for self posts which are very long walls of text without line breaks.
This bot then comments on those posts, suggesting that the author break it up into many smaller paragraphs.

It's daunting to see long unbroken walls of text.
I hope that by writing this bot, I will help people write better posts, which makes the Reddit community better for everyone.

## Behavior

You can see the result [here](https://www.reddit.com/user/paragraphiser_bot).

My bot currently only watches [r/relationship_advice](https://www.reddit.com/r/relationship_advice).
If it sees a text-only post which is long and only a single paragraph, it posts something like:

> <p>Beep boop, I'm a bot.</p>
>
> <p>It seems you've posted a huge wall of text. This is a bit daunting for users browsing Reddit, so they're unlikely to read the whole thing.</p>
>
> <p>It's OK to write a lot if you've got a lot to say. But perhaps you could insert some empty lines into your post, to break it into smaller, more palatable paragraphs?</p>

I choose the "Beep boop" part very deliberately.
By making my bot appear cuter, people are [less likely](https://theoatmeal.com/static/blog_google_self_driving_car.html) to respond negatively if it fails.

Sometimes people have already split up their post into one huge paragraph, and one or two small ones.
In that case I still want my bot to suggest that the author split it up more, but the text must be different.
My bot handles this case:

> Beep boop, I'm a bot.
>
> It seems you've posted a huge wall of text. This is a bit daunting for users browsing Reddit, so they're unlikely to read the whole thing.
>
> It's OK to write a lot if you've got a lot to say. It's great that you've already split the post into multiple paragraphs, however your largest paragraph is still 2366 words long. Perhaps you could insert some more empty lines into your post, to break it into more palatable paragraphs?

If the author edits their post after my bot comments, such that the text is multiple small paragraphs, my bot edits its comment:

> Beep boop, I'm a bot.
>
> It seems you've posted a huge wall of text... Thanks for splitting up your post. Now the largest paragraph size is only 176 words instead of 1400 words.



## Results

57% of authors edit their post to split it up into multiple paragraphs, in response to my bot.
It is currently in the top 10% of [most liked Reddit bots](https://botrank.pastimes.eu/?sort=rank&page=3).


## Technical Details

This bot is written in python, and deployed as a serverless *Lambda* function in Amazon's cloud.
The code is posted [on GitHub](https://github.com/mdavis-xyz/paragraphiser_bot_aws/tree/paragraphiser).
If you want to write your own bot, have a look at [my template](https://github.com/mdavis-xyz/paragraphiser_bot_aws).

The code uses the [Praw library](https://praw.readthedocs.io/en/latest/) to access Reddit's API.
Unfortunately Reddit offers no kind of webhook, so bots must poll the API to get new posts.
This poses a challenge for this bot.
If an author modifies their post in response to my bot, and it ceases to be eligible for comment by my bot, I want to edit my comment, lest my bot appear broken. I want to make such modifications promptly. (Within 2 minutes)
However I cannot poll every commented-on post every minute, because I get rate limited.
So I use a kind of exponential backoff.
Posts my bot commented on recently are checked very frequently.
Posts my bot commented on a long time ago are checked very infrequently.

The overall architecture is that one Lambda function polls Reddit every minute for new posts.
If a post is eligible (that is, it is a text-only post which has a long maximum paragraph length) then the bot comments on it.
Information about the post (including the original text of the post) is saved into Dynamodb.
The post ID and many timestamps are each saved as their own row in another table, which is used as a scheduler.
Another Lambda function checks that database every minute.
If any timestamps in that database are now in the past, that function triggers a third Lambda, with the post ID as an argument.
If multiple posts need to be checked at the same time, the scheduling Lambda will trigger many other Lambdas in parallel.

This third Lambda checks whether the post has been edited. If so, the comment is edited.
It also checks whether that comment was down-voted below 0.
If that happens, it sends me an email.

The exact metric this bot uses to decide whether to comment on a post is the number of characters in the longest paragraph.
This requires a little bit of effort to calculate, because Reddit comments are written in Markdown.
Text separated by a single newline character gets rendered as the same paragraph.
My code needs to ignore single newline characters, and instead check for when there are 2 or more.
I have come across posts where someone used a non-standard whitespace character to break lines.
My bot needs to account for that.
Similarly, my bot parses Markdown lists.
If a post contains a list (numbered or not), it may contain many characters which are not separated by 2 or more newline characters.
However lists do not look like a daunting wall of text.
So my bot counts each list item as a separate paragraph.

### Tooling and Infrastructure

Running your own server can be a lot of hassle, and results in downtime, and hardware costs.
I initially ran my bot on a [BeagleBone server](https://beagleboard.org/black/).
However a lightening strike in my street fried it.
I took that opportunity to re-write the bot and deploy it to AWS Lambda.

If you don't know what Amazon's *Lambda functions* are: You give them code, and they run it.
You don't need to worry about an operating system (`sudo apt-get install blah`).
You don't need to worry about scaling.
If my Reddit bot wants to comment on a thousand posts per second today, and nothing tomorrow, Amazon will happily handle that.
(Reddit will definitely throttle that, but my point is that you don't need to worry about scaling, and you only pay for the seconds of computation that you use.)

This project includes comprehensive tooling to deploy Lambda functions in a robust way with CloudFormation templates and in-cloud unit testing.
This tooling parallelises all aspects of lambda deployment:

 * virtual environment creation
 * zipping
 * uploading
 * testing

## How To Use It

If you want to write your own bot, have a look at [my template](https://github.com/mdavis-xyz/paragraphiser_bot_aws).
