from multiprocessing import Pool
import random
import requests

import yaml
from jinja2 import Template
from wayback import WaybackClient

import myspellcheck

content_fname = 'abbott.yaml'
topic_fname = 'topics.yaml'
template_fname = 'template.j2.html'
output_fname = 'stub.html'
style_template_fname = 'styles.j2.css'
style_output_fname = 'docs/styles.css'
good_urls_fname = 'good-urls.txt'
bad_url_excemptions_fname = 'bad-urls-excemptions.txt'
good_url_recheck_fraction = 0
already_archived_fname = 'already-archived.txt'

def main():
    # read in the data
    with open(content_fname,'r') as f:
        data = yaml.safe_load(f)

    # map tags to topics (many to many)
    with open(topic_fname,'r') as f:
        topics = yaml.safe_load(f)
    for t in topics:
        t['aliases'] = set(a.lower() for a in t['aliases'])
    all_tags = set(a.lower() for t in topics for a in t['aliases'])
    for (i,row) in enumerate(data, start=1):
        assert 'tags' in row, f"No tags for item {i} {row['text'][:50]}"
        row['tags'] = set(t.lower() for t in row['tags'])
        row['topic_ids'] = set(t['class'] for t in topics if t['aliases'] & row['tags']) # set intersection
        assert row['topic_ids'], f"No matching topics for tags for item {i}: tags {', '.join(row['tags'])}: {row['text'][:40]}..."
        for t in row['tags']:
            assert t.lower() in all_tags, f"Unknown tag {t} in item {i}: {row['text'][:20]}"


    # check URLs
    try:
        with open(good_urls_fname, 'r') as f:
            good_urls = set(u.strip() for u in f if u.strip())
    except FileNotFoundError:
        good_urls = set()
    try:
        with open(bad_url_excemptions_fname, 'r') as f:
            exempt_urls = set(u.strip() for u in f if u.strip())
    except FileNotFoundError:
        exempt_urls = set()
    try:
        with open(already_archived_fname, 'r') as f:
            archived_urls = set(u.strip() for u in f if u.strip())
    except FileNotFoundError:
        archived_urls = set()

    with open(good_urls_fname, 'a') as gf:
        with open(bad_url_excemptions_fname, 'a') as ef:
            with open(already_archived_fname, 'a') as aaf:
                with Pool() as p:
                    with requests.Session() as requests_session:
                        # with WaybackClient(requests_session) as wayback_client:
                            for (r, row) in enumerate(data, start=1):
                                assert row.get('urls', []), f"No urls for {row['text'][:30]}"
                                assert len(row['urls']) == len(set(row['urls'])), f"Duplicate urls for {row['text'][:30]}"
                                urls_to_check = []
                                for url in row['urls']:
                                    assert '?utm_source' not in url, f"Social utm junk in URL: {url}"
                                    if (url not in exempt_urls) and \
                                       ((url not in good_urls) or random.uniform(0,1) < good_url_recheck_fraction):
                                        urls_to_check.append(url)

                                    # I'm no longer updating this page
                                    # So most this links will eventually go stale.
                                    # Just skip checking
                                    # if not url.startswith('https://web.archive.org') \
                                    #    and url not in archived_urls:
                                    #     try:
                                    #         next(wayback_client.search(url))
                                    #     except StopIteration:
                                    #         print(f"No wayback snapshot found for url, archiving {url}")
                                    #         r = requests_session.get('https://web.archive.org/save/' + url)
                                    #         r.raise_for_status()
                                    #         print(f"Archived: {r.url}")
                                    #     except AttributeError as e:
                                    #         if str(e) == "'Session' object has no attribute 'search_calls_per_second'":
                                    #             # unsure why this is happening,
                                    #             # but I'm not updating this page anymore anyway
                                    #             # so this code isn't really necessary
                                    #             # Ignore the error
                                    #             print(f"Ignoring wayback client error for {url}")
                                    #         else:
                                    #             raise
                                    #     else:
                                    #         print(f"Already in wayback machine: {url}")
                                    #     archived_urls.add(url)
                                    #     aaf.write(url + '\n')

                                    # results = p.map(check_url, urls_to_check)
                                    # for (url, result) in zip(urls_to_check, results):
                                    #     if result:
                                    #         if url not in good_urls:
                                    #             print(f"Adding {url}")
                                    #             gf.write(url + '\n')
                                    #             good_urls.add(url)
                                    #     else:
                                    #         # with open('expired-links.txt', 'a') as ef:
                                    #         #     ef.write(url + '\n')
                                    #         excempt = input(f"Error with url\n{url}\nline {r}\nAdd excemption? (Y|N)\n")
                                    #         if excempt.strip().upper() in ['Y', 'YES']:
                                    #             ef.write(url + '\n')
                                    #             exempt_urls.add(url)
                                    #         else:
                                    #             raise ValueError(f"Bad URL on row {r}: {url}")

    # render the HTML
    with open(template_fname, 'r') as f:
        template = Template(f.read(), trim_blocks=False)
    html_s = template.render(data=data, topics=topics)
    with open(output_fname, 'w') as f:
        f.write(html_s)

    # render the CSS
    with open(style_template_fname, 'r') as f:
        template = Template(f.read(), trim_blocks=False)
    css_s = template.render(topics=topics)
    with open(style_output_fname, 'w') as f:
        f.write(css_s)

def check_url(url) -> bool:

    headers = {}

    # these sites don't like robots
    # silly, I send lots of legit traffic their way because my site is popular
    # so I think it's ethical to forge the user agent
    # these are only HEAD requests after all
    anti_robot_sites = ['reneweconomy', 'junkee.com', 'mumbrella', 'theaustralian.com.au', 'ohchr.org', 'theregister.co.uk', 'nortonrosefulbright']
    firefox = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/99.0'
    if any(s in url for s in anti_robot_sites):
        headers['user-agent'] = firefox
    try:
        r = requests.head(url, allow_redirects=True, headers=headers, timeout=8)
        if r.status_code >= 300:
            # try again with different user agent
            # and swap head for get
            headers['user-agent'] = firefox
            r = requests.get(url, allow_redirects=True, headers=headers)
            if r.status_code < 300:
                print(f"URL is blocking robots based on user agents: {url}")
        if not (200 <= r.status_code < 300):
            print(r.text[:200])
            print(f"Error status {r.status_code} for {url}")
        return 200 <= r.status_code < 300
    except KeyboardInterrupt:
        raise
    except Exception as e:
        print(f"Error for {url}: {e}")
        return False

if __name__ == "__main__":
    main()
