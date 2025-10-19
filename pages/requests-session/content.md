Imagine you want to use Python and the [`requests`](https://docs.python-requests.org/en/latest/index.html) library to scrape data from an API site with URLs like:

* `https://example.com/data/2015.json`
* `https://example.com/data/2016.json`
* ...
* `https://example.com/data/2025.json`

Many people write something like:

```
import requests

data = []
for year in range(2015, 2026):
    url = f"https://example.com/data/{year}.json"
    resp = requests.get(url)
    resp.raise_for_status()
    data.append(resp.json())
```

There's a small trick you can use to improve this: [`requests.Session`](https://docs.python-requests.org/en/latest/user/advanced/#session-objects)!
This looks like:

```
import requests

s = requests.Session()
data = []
for year in range(2015, 2026):
    url = f"https://example.com/data/{year}.json"
    resp = s.get(url)
    resp.raise_for_status()
    data.append(resp.json())
```

This two-line change can drastically speed up your code.
It does so by [re-using](https://en.wikipedia.org/wiki/HTTP_persistent_connection) the TCP connection across requests.

In the first code snippet, each `requests.get()` call results in a new TCP handshake, a new TLS handshake, and a new HTTP connection on top of that. By using a `session`, only one TCP connection, one TLS handshake and one HTTP connection is used.
If you are making a large number of small requests this can make a large difference.
In one use case of mine it sped up data downloading by [a factor of 3](https://github.com/UNSW-CEEM/NEMOSIS/pull/48#issue-2770083169).
This also reduces the load on the server.

I have seen several API client libraries use a wrapper function to add authentication, custom user agents, or other custom headers to each requests (e.g. [OpenSky](https://github.com/openskynetwork/opensky-api/blob/49c4f312a80083a93b4f881ea1785ae052572dc9/python/opensky_api.py#L290)) or client libraries which add `headers=self.headers` to every `requests.get()` call (e.g. [mms-monthly-cli](https://github.com/prakaa/mms-monthly-cli/pull/15/files)).
With `requests.Session`s you only need to define custom headers once.
THis is fewer lines of code, and I think that for many API clients and scraping jobs, it makes more sense stylistically to separate configuration such as authentication from the actual logic of constructing URL paths to call.
You can see this simplification in [my pull request for Nemosis](https://github.com/UNSW-CEEM/NEMOSIS/pull/48/files#diff-568a26ecf53e68b0aba7b0fbbaf559eee1fa8324b1e70abab3964ddf863bc8c3L98).

In summary, if you're going to use `requests` for more than one request to the same domain, you should probably use `request.Session()`. One addition line of code can give a tremendous speedup, and makes managing headers nicer.