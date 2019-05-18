The purpose of an election is to:

   1. fairly decide a winner; and
   2. convince the losers that the decision was fair

Voting machines and online voting fail to achieve both of these objectives.

There are some insurmountable theoretical security issues which can *never* be resolved.
Worse still is that in practice voting machines and online voting are consistently insecure against even the most basic attacks, due to a shocking lack of due diligence.

This means that digital voting is worse at achieving the first goal than paper.
The fact that digital election fraud is hard and frequently impossible to detect means that it fails at the second goal too.

[ ![xkcd comic about voting security](images/xkcd-blockchain.png) ](https://xkcd.com/2030/)

## Different from banks

Many people ask the question:

> If I can securely do my banking online, why can't I cast my vote online?

The short answer is that banking and elections have two very different threat models.

Cryptography is *not* the primary protection that keeps your money safe when banking online.
The primary security measure is the fact that *when* your account gets [cracked](https://stallman.org/articles/on-hacking.html), your bank will just pay you back, out of their own pocket.
They will cop that as an operational loss, because doing so is cheaper than implementing extreme security measures.

The other difference between banking and elections is that bank fraud is very easy to detect.
Either:

* your total account balance does not equal the sum of all past transaction; or
* there is a transaction you do not recognise

How could election fraud be detected with digital voting?
There are several types of digital voting:

1. fully online voting (e.g. visiting a website and clicking a button)
2. paperless voting machines in poll booths
3. machines which count paper ballots (and possibly a second machine to print the paper)

For options 1 and 2, it is *literally impossible* to detect fraud if it happens.
Of course fraud can *sometimes* be detected, like the time multiple vote counting machines submitted [*negative* votes](https://www.motherjones.com/politics/2004/03/diebolds-political-machine/) for Al Gore.
Of course if the total number of votes is [far different](https://en.wikipedia.org/wiki/1927_Liberian_general_election) to the total number of voters, fraud is obvious.
However it only takes a dozen flipped votes at a carefully chosen electorate to change the outcome of the whole election. #TODO link
If the outcome is a close call, or the integrity of the machines is in doubt, you cannot do a re-count.
The possibility of a recount is one of the main essential features you lose if you abandon paper.

For option 3, some ["VVPAT"](https://freedom-to-tinker.com/2018/10/19/continuous-roll-vvpat-under-glass-an-idea-whose-time-has-passed/) systems use a digital touchscreen for voter input, and then print a paper ballot, which is mechanically dropped into a sealed box.
This allows voters to see their vote printed (without touching it).
However what happens if a voter claims the vote they saw printed was not what they selected?
Do you stop all voting on that machine, all machines in that polling place, all machines in the country?
What if the voter just mis-remembered what they chose?
There is no way to know, therefore you do not get the full benefit of paper.

Some systems use a voting machine to provide a simpler and nicer interface than paper.
They print a ballot, which the voter can inspect and then insert into the box.
However in practice half of voters don't check, and most [do not notice an error](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3292208) when it is wrong.
Ultimately such a system is [just a very expensive pencil](https://www.youtube.com/watch?v=w3_0x6oaDmI).


It might seem like this does not matter if you just make sure that the devices don't get compromised in the first place.
However recounting is a safety net that provides an extra layer of security.
All good security systems multiple layers of protection for [Defence in Depth](https://en.wikipedia.org/wiki/Defense_in_depth_%28computing%29) (like multiple concentric walls protecting a castle).
Furthermore, as enumerated below, it is impossible in practice and even in theory to defend against the kind of bad actors elections face.


[ ![Another xkcd comic about voting security](images/xkcd-antivirus.png) ](https://xkcd.com/463/)

A bank only needs to defend themselves against [script kiddies](https://en.wikipedia.org/wiki/Script_kiddie), and at worst organised crime gangs.
Election officials must defend their system against foreign nation states.
Their enemies are as powerful as the [NSA](https://www.theguardian.com/world/2013/sep/05/nsa-gchq-encryption-codes-security), and [Russia's Kremlin](https://www.wired.com/story/russia-election-hacking-playbook/).
The stakes for big elections are [literally *trillions* of dollars](https://www.youtube.com/watch?v=w3_0x6oaDmI), so the enemies will be willing to spend comparable amounts of money to change the outcome.

One example of the kind of attacks that nation states can deploy is that America's NSA deliberately lobbied standards group to adopt an encryption algorithm [they knew how to break](https://en.wikipedia.org/wiki/Dual_EC_DRBG).

Another example is the [STUXNET](https://en.wikipedia.org/wiki/Stuxnet) attack, where the US and Israeli governments managed to inject malware into a computer which was completely offline.

# TODO: mention anti-encryption legal back doors, and Intel iDRAC

# TODO: mention 2G attack

But worst of all is the [Ken Thompson Hack](./KTH.pdf).
Someone may write innocent and strong software for a voting machine, but if that software developer's laptop was infected with this worm, the compiled (computer readable) version of their code can be modified to be different to what they wrote.
For example, the worm could tell the voting machine to change every 10th vote for Party X to a vote for Party Y.
The shocking thing about this is that since it is impossible to convert any non-trivial computer code back to human-readable form, this attack is undetectable.
Since some software on every computer originated from another computer (which could be infected), it is *theoretically impossible* to know with certainty that any device has not been infected.
This attack is difficult to execute.
However when *trillions* of dollars are on the line, it's quite conceivable.

## Digital Voting In Practice

The above section explained how the [Ken Thompson Hack](http://wiki.c2.com/?TheKenThompsonHack) means that there exists malware which is impossible to detect or prevent.
However in practice, the actual state of online voting and voting machine security is far, far worse.

Digital voting systems are designed or operated very insecurely
[again](https://www.commondreams.org/views/2018/11/05/voting-machines-what-could-possibly-go-wrong)
and [again](https://freedom-to-tinker.com/2006/05/11/report-claims-very-serious-diebold-voting-machine-flaws/)
and
[again](https://web.archive.org/web/20101019133156/http://itpolicy.princeton.edu/voting/summary.html)


> "‘‘What I’ve seen in the past 10 years is that the vendors have absolutely fumbled every single attempt in security" says Jacob D. Stauffer, vice president of operations for Coherent Cyber, who has conducted voting-machine security assessments for California’s secretary of state for a decade" ([source](https://www.nytimes.com/2018/02/21/magazine/the-myth-of-the-hacker-proof-voting-machine.html))

> Every single one of [the tested machines] had some sort of weakness ([source](https://www.fastcompany.com/40448876/how-hackers-are-teaching-election-officials-to-protect-their-voting-machines-learned-from-hackers-to-improve-security-for-future-elections))

In 2018 DEF CON (an international security convention) made voting machines available to see how well they stand up to actual attackers.
30 minors were able to compromise the machines, including an 11 year old who changed the outcome of the mock election in [10 minutes](http://time.com/5366171/11-year-old-hacked-into-us-voting-system-10-minutes/).
Machines which can be compromised by an 11 year old in 10 minutes are being used for real elections with actual stakes.

There are *many* examples of real elections where voting machines were [wirelessly connected to the internet](https://arstechnica.com/tech-policy/2015/04/meet-the-e-voting-machine-so-easy-to-hack-it-will-take-your-breath-away/), using weak protocols, [running remote desktop software](https://www.nytimes.com/2018/02/21/magazine/the-myth-of-the-hacker-proof-voting-machine.html) (which allows remote users to control the device).

If you can think of a way voting machines or online voting could go wrong, then there is almost certainly an example of an actual real election where exactly that has happened.
There are machines which:

* transmit vote counts to the central office *without any encryption* (This is like stapling a $100 note to a postcard and expecting it to get to the destination.)
  [source](https://news.ycombinator.com/item?id=15190148)
* download software updates in *without any encryption*, and without any signatures, from servers which can be easily taken over
* run *remote desktop software*
  [source](https://news.ycombinator.com/item?id=15190148)
* run versions of Windows which were abandoned by Microsoft over a decade ago, and have received no security patches since
  [source](https://arstechnica.com/tech-policy/2015/04/meet-the-e-voting-machine-so-easy-to-hack-it-will-take-your-breath-away/)
  [source](https://www.theguardian.com/us-news/2015/apr/15/virginia-hacking-voting-machines-security)
* use weak passwords like "admin" or "test", or hard coded passwords which can't be changed, or the instruction manuals *recommend* using and re-using weak passwords
  [source](https://arstechnica.com/tech-policy/2015/04/meet-the-e-voting-machine-so-easy-to-hack-it-will-take-your-breath-away/)
  [source](https://www.theguardian.com/us-news/2015/apr/15/virginia-hacking-voting-machines-security)
  [source](https://www.vice.com/en_us/article/kzvejx/voting-machine-manual-instructed-election-officials-to-use-weak-passwords)
  [source](https://news.ycombinator.com/item?id=15190148)
  [source](https://www.infoworld.com/article/2618965/threatened-by-anonymous--symantec-tells-users-to-pull-pcanywhere-s-plug.html)
* use passwords which are saved in a file which is publicly accessible online
  [source](https://news.ycombinator.com/item?id=15190148)
* Have WiFi antennas, configured to use weak, outdated encryption algorithms which can be cracked from outside the building in 10 minutes
  [source](https://arstechnica.com/tech-policy/2015/04/meet-the-e-voting-machine-so-easy-to-hack-it-will-take-your-breath-away/)
* contain undocumented SD card ports and exposed USB ports which voters can plug malicious drives into. (USB ports are often how the candidate list and intended software is loaded each election)
  [source](https://www.fastcompany.com/40448876/how-hackers-are-teaching-election-officials-to-protect-their-voting-machines-learned-from-hackers-to-improve-security-for-future-elections)
  [source](https://www.fastcompany.com/40448876/how-hackers-are-teaching-election-officials-to-protect-their-voting-machines-learned-from-hackers-to-improve-security-for-future-elections)
* save *no logs*, so the modification of data files or installation of basic malware from an SD card or wirelessly would not be detected
   [source](https://www.theguardian.com/us-news/2015/apr/15/virginia-hacking-voting-machines-security)
* Are sold without having onboard data erased, and with the “Property Of” government labels still attached (akin to selling a police car with the police logo still on it)
   [source](http://web-old.archive.org/web/20181101205425/https://www.wired.com/story/i-bought-used-voting-machines-on-ebay/)
  [source](http://web-old.archive.org/web/20181101205425/https://www.wired.com/story/i-bought-used-voting-machines-on-ebay/)
* use easily-pickable physical padlocks, and contain chips which can be reprogrammed by just plucking them out and replacing them with chips with other code
  [source](https://www.fastcompany.com/40448876/how-hackers-are-teaching-election-officials-to-protect-their-voting-machines-learned-from-hackers-to-improve-security-for-future-elections)
  [source](http://citpsite.s3-website-us-east-1.amazonaws.com/oldsite-htdocs/voting/advantage/)
  [source](https://freedom-to-tinker.com/2016/09/20/which-voting-machines-can-be-hacked-through-the-internet/)

* storage between elections # TODO: link

There was even a case a stray radiation particle from space hitting a transistor and [flipping a single bit](https://motherboard.vice.com/en_us/article/9agbxd/space-weather-cosmic-rays-voting-aaas), which changed the numbers, causing the other candidate to win.
This was only detected because the new total count was too high, by an amount which was a power of 2.

That is what happens with devices designed and used solely for elections, secured by dedicated electoral organisations whose job is to keep the devices secure.
Online voting where voters can cast their vote using an app or website will necessarily be worse.
Many actual elections which have used online voting have had real production systems be taken over by attackers, easily.

> Within 36 hours of the system going live, our team had found and exploited a vulnerability that gave us almost total control of the server software, including the ability to change votes and reveal voters’ secret ballots. [source](https://freedom-to-tinker.com/2010/10/05/hacking-dc-internet-voting-pilot/)



# TODO: Aus example
# TODO: other online examples (notes below)
# mention flux

* SQL injection - https://www.rollcall.com/news/whitehouse/barrs-conclusion-no-obstruction-gets-new-scrutiny
* Researchers renamed candidates on live ballot website, took 2 days before officials noticed  https://www.thenation.com/article/american-democracy-is-now-under-siege-by-both-cyber-espionage-and-gop-voter-suppression/
* Email ballots are like "would be like stapling a $100 bill to a postcard and expecting it to get to its destination unmolested" https://www.llnl.gov/news/security-risks-and-privacy-issues-are-too-great-moving-ballot-box-internet

* mention Flux, Estonia
* website/app
* NSW online system tracks how you voted https://freedom-to-tinker.com/2015/03/22/ivote-vulnerability/
   * Uses 3rd party analytics tool tool
   * "Why should the public accept the election results when the method of counting and verifying their votes is a secret?"

* average device's security
* link to Boing Boing?
* No way to do a vote recount (unless you forgo anonymity, and allow gun-to-head voting)


Most consumer devices (such as phones and laptops) are [*already* infected](https://www.youtube.com/watch?v=w3_0x6oaDmI) with relatively simple malware.
If consumers cannot protect themselves from malware made by simple individual attackers, how could they possibly defend against malware made by a foreign nation's military, specifically for the purpose of election rigging?
If you cast a vote on a device which is infected with something, you cannot know that what you see on the screen matches the data which is actually sent to the server.

Computers can perform checksums and hashes to "fingerprint" their software and ensure it matches the official fingerprint.
However if the device is infected such that an attacker can change your vote, then it is easy for them to also change the fingerprint calculation, thereby hiding their tracks.

The only way to mitigate this is to allow users to subsequently request a confirmation of who they voted for (such as from a different device).
If this is possible then your vote is not anonymous.
This means that abusive partners can make threats like "you better vote for the party I want, or else".
(Even with anonymity, for any at-home voting you cannot prevent over-the-shoulder coercion when the vote is cast.)

Furthermore, it is technologically impossible to meaningfully separate the fact that you voted (to prevent double-voting) from *who* you voted for (anonymity).


## How big a flaw is big enough?

You only need to fudge a few votes to sway the election. Even fewer to destroy trust

   # TODO: source

## Could regulation fix security issues?

As explained above, the Ken Thompson hack means that some malware can infiltrate systems and remain undetected by even well funded, well trained people using world's best practice.
All the practical implementation flaws enumerated above also remain despite regulation.

In most US jurisdictions it is illegal to connect machines to the Internet.
However vendors consistently use channels which are equally or less secure, such as unencrypted 2G phone calls, [vulnerable to man-in-the-middle attacks](https://freedom-to-tinker.com/2018/02/22/are-voting-machine-modems-truly-divorced-from-the-internet/).  

It is typically illegal to install remote desktop software on voting machines in the US.
However one vendor [did it anyway](https://motherboard.vice.com/en_us/article/mb4ezy/top-voting-machine-vendor-admits-it-installed-remote-access-software-on-systems-sold-to-states), and then lied about it.
The software they installed [remote execution of arbitrary code](https://www.zerodayinitiative.com/advisories/ZDI-12-018/).
This tool was so insecure that the company who makes it [recommends not using it](https://www.infoworld.com/article/2618965/threatened-by-anonymous--symantec-tells-users-to-pull-pcanywhere-s-plug.html).
The machine makers claim they had no knowledge of that software, so how did it get there?
Either the machine makers were malicious or incompetent.
Both explanations are bad.
How can you patch code you don't know is there?

# TODO: mention donations

In practice voting machines are regulated, audited, inspected and secured [*less* diligently than gambling machines](https://www.nytimes.com/2004/06/13/opinion/gambling-on-voting.html).

## Commercial Vendors and Proprietary Software

It only takes a few lines of code to turn innocent vote counting software into malicious vote-flipping software.
The first step for any regulator would be to use public, open-source code.
That way they can see that the code which is *supposed* to eventually end up counting votes is not malicious.
However this never happens.
In practice voting software is always proprietary.
This means it is secret.
Vendors refuse to show the code to security researchers, let alone average citizens.
In some cases it is even [*illegal*](https://www.thenation.com/article/touch-and-go-elections-perils-electronic-voting/) for security researchers to try to probe such software for vulnerabilities.
(Such laws won't stop bad guys from finding vulnerabilities to rig the election with, but they [will stop good guys](https://www.fastcompany.com/40448876/how-hackers-are-teaching-election-officials-to-protect-their-voting-machines-learned-from-hackers-to-improve-security-for-future-elections) from finding those vulnerabilities and fixing them first.)

Recall the 2nd reason why elections take place.
Voters who support the losing party must be convinced that the decision was fair.
If you have voting machines, this means that they must be convinced the machines were not compromised.

Imagine if you cast your vote by making a phone call to a human, telling them your vote, and then at the end of the day they tell the central office what their totals were.
That's crazy.
That's insane.
That's obviously a *terribly*, *fundamentally fucked* idea.
But that's effectively [how all proprietary voting software works](https://www.youtube.com/watch?v=w3_0x6oaDmI).

By choosing to use proprietary voting systems, **governments are giving control of the election to a private company who have a strong financial incentive to hide known vulnerabilities and prevent security researchers from finding bugs.**

## Usability



<!-- ffmpeg -an -i ../buggy.mp4 -b 1000 -crf 30 -profile:v baseline buggy-small.mp4 -->
<video autoplay loop class="video appear"  width=360 height=640 autobuffer muted playsinline video-auto-ctrl  preload defaultMuted>
   <source src="images/buggy-small.mp4" type="video/mp4">
   <source src="images/buggy-small.webm" type="video/webm">
</video>

All software has bugs, typically around [10 to 50 bugs](https://www.mayerdan.com/ruby/2012/11/11/bugs-per-line-of-code-ratio) for every 1000 lines of code.
To run a touchscreen interface developers must write approximately 10,000 lines of code.
Therefore a voting machine, counting machine or end-user mobile phone with a touch screen will have about 100 to 500 bugs just in the screen software alone.
As shown in the image above, the consequences of using software with hundreds of bugs to run an election are catastrophic.
This example is [one of many](https://www.nytimes.com/2018/02/21/magazine/the-myth-of-the-hacker-proof-voting-machine.html) where the screen displayed a different vote to what the voter intended.
These problems do not happen with paper ballots.


In March a dozen European Union members cast their vote incorrectly, because the user interface of the voting systems did not make it clear whether they were voting on ammendments or the whole bill.
The consequence is that legislation not supported by the majority was passed, and the whole internet all around the world was impacted as a result.
This happened to politicians whose entire job is voting, and understanding the process.
So how could an average Joe voting once a year of less possibly fare any better?

In one Texas vote, the machines took many seconds to render each page on the screen.
If voters touched the screen before that rendering finished, the machines [threw away their vote](https://www.vice.com/en_us/article/negayg/texas-voting-machines-have-been-a-known-problem-for-a-decade).
The officials response from officials was to claim nothing was wrong, and to blame voters for not waiting "at least 3-5 seconds for all choices to be rendered on the eSlate voting machines".
If a computer takes 5 seconds to print some simple text on a screen from a local drive, then something is fundamentally wrong about how that software was written.

Paper ballots are incredibly cheap.
The ballot costs a few cents, and the cardboard booths and pencils cost a few dollars.
So polling places can afford to install as many as they can fit into the room.
In Australia many voters can walk straight in, and it's rare to queue for more than 20 minutes.
In contrast, voting machines cost [several thousand dollars each](https://www.thenation.com/article/touch-and-go-elections-perils-electronic-voting/).
Consequently voter throughput is lower, so votes frequently queue for [*literally many hours*](https://arxiv.org/ftp/arxiv/papers/0810/0810.5577.pdf).
If we want to have a strong and healthy democracy it is essential that it is easy to cast a vote.
When it comes to queue length, voting machines do the opposite.


## The security of paper

In the 2000 US presidential election paper ballot counting machines miscounted a substantial amount of votes, because of the [hanging chad issue](https://www.urbandictionary.com/define.php?term=hanging%20chad).
The consequence was that the elected president was [likely *not*](https://en.wikipedia.org/wiki/2000_United_States_presidential_election_recount_in_Florida) the president who received the most votes.
That would not have happened if the ballots had been counted by hand.

Rather than go back to manual counting, the US doubled down on digital voting, of all types.
It is now common for elections in the US to use two stage systems with paper in between, or direct vote systems with no paper, or [even *email* ballots](https://www.youtube.com/watch?v=w3_0x6oaDmI).
(Most email is completely unencrypted. It is trivial to send an email and make it look like someone else sent it. So this is as secure as voting via postcard.)

The method of physical voting with paper ballots and manual counting is centuries old.
Pretty much all attacks have been tried, discovered, and defended against.
For example, the reason you are given a pencil not a pen is to defend against the possibility of voters swapping pens for ones with disappearing ink.
That is the level of paranoia which electoral systems *should* have.

In Australia (and around the world) paper ballots are counted by you, the citizens.
The officials are volunteers from across the political spectrum.
In constrast most voting machines are made by only a handful of vendors, who are [highly partisan](https://www.motherjones.com/politics/2004/03/diebolds-political-machine/).
The CEO of one publicly proclaimed that he will be "helping Ohio deliver its electoral votes to the President."

If you are concerned that the people counting your vote will deliberately fudge the numbers, you can simply walk into the polling place and watch them.
If you are concerned about a voting machine, there is nothing you can do.

For systems which have no paper trail, there is no possibility of a recount.
You are forced to blindly trust the integrity and competency of everyone in the supply chain, which includes vendors, upstream hardware makers, officials, everyone who has access to the machine in the years between elections, every voter who had private physical access to the machine, and so on.

For systems which print out a paper receipt for you but submit the vote digitally, you cannot know whether the machine flipped your vote in the digital record, but printed your intended vote on the receipt.

For ballot counting machines, what happens if you want to recount because you question the machine?
You cannot recount with the same machine, because that will give you the same possibly-corrupt answer.
What about another machine in the same polling place?
If the first machine was infected, that one could be too.
What about another machine in another polling place?
That's probably made by the same vendor, with the same flaws.

It only takes a few extra bytes of code to turn legitimate vote counting software into vote-flipping software.
It is impossible to convert non-trivial 1s and 0s back into human readable form.
Voting machines are a [black box](https://en.wikipedia.org/wiki/Black_box).

One of the challenging problems which paper solves is ensuring that each person votes only once, that vote definitely ends up in the count, and no one can see how any individual voted.
This last part is crucial, especially when there is no paper trail.
If it is possible to verify that your vote ended up in the database as you intended, then coercive votes become possible.
For example, an evil boss can say "vote for party x or I'll fire you".
(Yes it is conceivable that you can take legal action *after* the fact, but paper votes make this *impossible*.)


## The Motivation

One main motivation for digital voting is to make the counting process faster.
But why do we need to rush?
In the [2016 Australian federal election](https://en.wikipedia.org/wiki/2016_Australian_federal_election) it took *4 weeks* until results were finalised.
The nation did not falter.
The sky did not fall.
Parliament steers the nation on a time-scale of years, so waiting hours or even weeks for a count is not of great consequence.

As mentioned earlier, voting machines are *expensive*. Paper is cheap, and vote counters work for free.
So cost reduction is an invalid motivation for digital voting.

A motivation for online voting is convenience for voters.
Convenience is nice.
However citizens in Australia cast a vote for any level of government about once per year, and the stakes are very high.
For voters busy on election day, they can cast a vote in the weeks prior.
This is increasingly popular, with [3 million voters](https://www.abc.net.au/news/2019-05-15/federal-election-pre-poll-votes-could-delay-antony-green-result/11114492) doing so in the 2019 election.

Convenience is important, but since digital voting violates both of the original goals of an election (fair decision, which losers trust is fair), the trade-off is not worth it

## Conclusion
