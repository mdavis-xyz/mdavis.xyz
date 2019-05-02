The purpose of an election is to:

   1. fairly decide a winner; and
   2. convince the losers that the decision was fair

Voting machines and online voting fail to achieve both of these objectives.

There are some insurmountable theoretical security issues which can *never* be resolved.
Worse still is that in practice voting machines and online voting are consistently insecure against even the most basic attacks, due to a shocking lack of due diligence.

This means that digital voting is worse at achieving the first goal than paper.
The fact that digital election fraud is hard and frequently impossible to detect means that it fails at the second goal too.

## Different from banks

* banking security is about money
* compare to what happens when election fraud discovered

* bank hack can be noticed
   * sum
   * transaction
   * transaction is recorded, vs anonymous vote
* what happens when voting goes wrong?
   * how to detect?
   * what if you do notice? (e.g. audit of paper receipts)
* threat model - NSA vs script kiddie
   * KTH

## Voting Machines In Practice

* everything that could possibly go wrong has
   * https://xkcd.com/2030/
   * link to my blockchain page
   * "‘‘What I’ve seen in the past 10 years is that the vendors have absolutely fumbled every single attempt in security,’’ says Jacob D. Stauffer, vice president of operations for Coherent Cyber, who has conducted voting-machine security assessments for California’s secretary of state for a decade" https://www.nytimes.com/2018/02/21/magazine/the-myth-of-the-hacker-proof-voting-machine.html
   * at DefCon, hackers broke all machines they tried within hours, without seeing them prior: https://www.fastcompany.com/40448876/how-hackers-are-teaching-election-officials-to-protect-their-voting-machines-learned-from-hackers-to-improve-security-for-future-elections
   * cosmic ray added 4096 votes https://motherboard.vice.com/en_us/article/9agbxd/space-weather-cosmic-rays-voting-aaas

What about checksums, encryption?
   * checksums
      *
      * Ken Tompsan hack
      * intel back doors

   * Comprehensive description of everything about machines https://www.commondreams.org/views/2018/11/05/voting-machines-what-could-possibly-go-wrong
   * 30 minors hack voting sites and machines in as little as 10 minutes : http://time.com/5366171/11-year-old-hacked-into-us-voting-system-10-minutes/
   * USB ports open https://www.fastcompany.com/40448876/how-hackers-are-teaching-election-officials-to-protect-their-voting-machines-learned-from-hackers-to-improve-security-for-future-elections
   * open telnet,
      * https://www.xkcd.com/463/
   * sold secondhand without deleting info: https://www.fastcompany.com/40448876/how-hackers-are-teaching-election-officials-to-protect-their-voting-machines-learned-from-hackers-to-improve-security-for-future-elections
   * trivial physical locks: https://www.fastcompany.com/40448876/how-hackers-are-teaching-election-officials-to-protect-their-voting-machines-learned-from-hackers-to-improve-security-for-future-elections

   * Remote access software installed again https://www.nytimes.com/2018/02/21/magazine/the-myth-of-the-hacker-proof-voting-machine.html

   * weak passwords: https://arstechnica.com/tech-policy/2015/04/meet-the-e-voting-machine-so-easy-to-hack-it-will-take-your-breath-away/
   * wifi enabled: https://arstechnica.com/tech-policy/2015/04/meet-the-e-voting-machine-so-easy-to-hack-it-will-take-your-breath-away/
   * old, weak encryption protocols: https://arstechnica.com/tech-policy/2015/04/meet-the-e-voting-machine-so-easy-to-hack-it-will-take-your-breath-away/
   * no patches https://arstechnica.com/tech-policy/2015/04/meet-the-e-voting-machine-so-easy-to-hack-it-will-take-your-breath-away/
   * Bad German machines https://news.ycombinator.com/item?id=15190148
   * Weak password  no patches, no logs https://www.theguardian.com/us-news/2015/apr/15/virginia-hacking-voting-machines-security
   * Voting machine severe flaw https://freedom-to-tinker.com/2006/05/11/report-claims-very-serious-diebold-voting-machine-flaws/
   * Voting machine flaws https://web.archive.org/web/20101019133156/http://itpolicy.princeton.edu/voting/summary.html
   * Chip swap http://citpsite.s3-website-us-east-1.amazonaws.com/oldsite-htdocs/voting/advantage/
   * Air gap not goof enough if you swap chip or card https://freedom-to-tinker.com/2016/09/20/which-voting-machines-can-be-hacked-through-the-internet/

* No way to do a vote recount (unless it's the 2 step system)
* paper as receipt not middle step: Of you're going to print paper anyway, and expect voters to read and understand it, why add the electronic part?
* what if paper wrong? Paper trail:" You might think, if the wrong candidate is printed on the VVPAT then this is strong evidence that the machine is hacked, alarm bells should ring– but what if the voter misremembers what he entered in the touch screen?  There’s no way to know whose fault it is." https://freedom-to-tinker.com/2018/10/19/continuous-roll-vvpat-under-glass-an-idea-whose-time-has-passed/

* 36 hours to compromise server in pentest https://freedom-to-tinker.com/2010/10/05/hacking-dc-internet-voting-pilot/

* Hard drives not wiped when sold http://web-old.archive.org/web/20181101205425/https://www.wired.com/story/i-bought-used-voting-machines-on-ebay/

## How big a flaw is big enough?

You only need to fudge a few votes to sway the election. Even fewer to destroy trust

## could it be regulated?

* Even when made illegal to connect machines to the internet, they just use unencrypted phone call or mitm vulneravle 2G instead https://freedom-to-tinker.com/2018/02/22/are-voting-machine-modems-truly-divorced-from-the-internet/   

* Gambling machines are more secure and transparent and accountable https://www.nytimes.com/2004/06/13/opinion/gambling-on-voting.html
segway into IP

### IP

* segway from previous section: Gambling machines are more secure and transparent and accountable https://www.nytimes.com/2004/06/13/opinion/gambling-on-voting.html

* https://www.thenation.com/article/touch-and-go-elections-perils-electronic-voting/ and illegal to scrutinise the software. Vendors are highly partisan
* remote desktop over wifi, with weak password:
   * https://arstechnica.com/tech-policy/2015/04/meet-the-e-voting-machine-so-easy-to-hack-it-will-take-your-breath-away/
   * probably same company: https://motherboard.vice.com/en_us/article/mb4ezy/top-voting-machine-vendor-admits-it-installed-remote-access-software-on-systems-sold-to-states
      * mentions that the vendor lied about remote access software. They claim they have no knowledge, so how did it get there? Malice or incompetence, both are bad. How can you patch code you don't know is there?
   * pcAnywhere had remote code execution bugs at the time: https://www.zerodayinitiative.com/advisories/ZDI-12-018/

* mention privatisation, and proprietary software (especially with regards to extreme threat model)
* DRM and other IP laws prevent security researchers from keeping us safe: https://www.fastcompany.com/40448876/how-hackers-are-teaching-election-officials-to-protect-their-voting-machines-learned-from-hackers-to-improve-security-for-future-elections
* when pcAnywhere source code was stolen, the maker advised to not use it, until they fixed patches. Proprietary stuff, hard coded keys etc https://www.infoworld.com/article/2618965/threatened-by-anonymous--symantec-tells-users-to-pull-pcanywhere-s-plug.html

Proprietary voting systems means giving control of the election to a private company who have a strong financial incentive to hide known vulnerabilities and prevent security researchers from finding bugs

### Usability

* Machines break down, and are expensive https://www.thenation.com/article/touch-and-go-elections-perils-electronic-voting/
* Long lines when expensive touchscreen machines are the constraint. So they are not faster
   * Paper about wait times being hours, (Aus is even more complex ballot) https://arxiv.org/ftp/arxiv/papers/0810/0810.5577.pdf
* Slow rendering means votes for the wrong party https://motherboard.vice.com/en_us/article/negayg/texas-voting-machines-have-been-a-known-problem-for-a-decade
* EU politicians pressed wrong button
* show buggy screen gif
   * article about similar problem elsewhere https://www.nytimes.com/2018/02/21/magazine/the-myth-of-the-hacker-proof-voting-machine.html

* 3 bugs per x lines, 10,000 lines for a touchscreen

## Online Voting In Practice

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


## The security of paper

* security of paper
   * average people
   * in public
   * from range of political spectrum

* gun to head
* one person one vote
   * can look up your own vote - no anonymity
      * when voting machines print out a sheet, half of voters don't check, and most do not notice a mistake https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3292208
   * can't, so no guarentee it went through



## The Motivation

* Why speed?
   * mention Gillard election

## Conclusion
