# My Website

This repo contains the content for [www.mdavis.xyz](www.mdavis.xyz).

## Achievements of the Coalition Government

I am no longer updating the [Achievements of the Coalition Government](https://www.mdavis.xyz/govlist/) page, since that government is no longer in power.
I am not creating an equivilent list for the current government. Creating this list was extremely time consuming. (No there's no 'trick'. I don't 'get' the list from anywhere. I just read a lot of news articles every day.) I do not have enough time or energy to do the same for the new government.

## Files and Folders

* `AWS` is for deploying the lambda function that counts page views. (The site itself is deployed on GitHub pages.)
* `docs` is what is published on GitHub pages. This is generated from `pages` with `convert.py`
* `extraWords.txt` is a dictionary of custom words for the spellchecking (by `myspellcheck.py`).
* `pages.yaml` is configuration for each page of the website
* `pages/` is the content of each page of the website

## Deployment and staging

I wrote the tooling for this many years ago, as my first front-end project. I deliberately wrote everything from scratch instead of using whichever framework is the flavour of the month, so that I could learn the fundementals. However I didn't know much about frontend work at the time, so it's not really optimal. The tooling is a bit messy (especially the spellchecker), not what I'd do if I started from scatch today. So if you're a potential employer checking out my work on GitHub, please look at a different repo.

GitHub can't directly handle a dev and prod website stage. So I actually have two copies of the website.

The dev stage is:

* https://dev.mdavis.xyz/
* git@github.com:mdavis-xyz/dev.mdavis.xyz.git
* https://github.com/mdavis-xyz/dev.mdavis.xyz

The prod stage is:

* https://www.mdavis.xyz/
* git@github.com:mdavis-xyz/mdavis.xyz.git
* https://github.com/mdavis-xyz/mdavis.xyz

To deploy to dev, push to the `master` branch of the `dev` repo.
To deploy to prod, push to the `master` branch of the `prod` repo.
Locally I have set up my clone as:

```
$ git remote -v
dev	git@github.com:mdavis-xyz/dev.mdavis.xyz.git (fetch)
dev	git@github.com:mdavis-xyz/dev.mdavis.xyz.git (push)
prod	git@github.com:mdavis-xyz/mdavis.xyz.git (fetch)
prod	git@github.com:mdavis-xyz/mdavis.xyz.git (push)
```

My workflow is:

```
python3 -s dev
git commit ...
git push dev master
```

Then to deploy to prod:

```
git checkout prod
git merge master
python3 -s prod
git commit ... # if merge clash
git push prod prod:master
```
