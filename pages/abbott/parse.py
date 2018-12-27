from mako.template import Template
import pypandoc
import re
import pprint as pp
import datetime as dt
import yaml
# import validators
# from django.core.exceptions import ValidationError
# from django.core.validators import URLValidator
# from django.conf import settings as djSettings
# djSettings.configure()
# from urlparse import urlparse
import sys
from subprocess import call
from multiprocessing import Pool
import random

template_fname = "template.html"
content_fname = "abbott.txt"
output_fname = "docs/index.html"
invalidURL_fname = "debug.yaml"
url_fname = "validURLs.txt"
bad_url_fname = "invalidURLs.yaml"
debug = True

urlCheckRatio = 0.1 # fraction of URLs to check
urlRecheckRatio = 0.1 # fraction of except URLs to check again

# returns True if the URL is valid
def wget(url):
    if debug:
        print('running wget on url %s' % url)
    commandBase = "wget --spider --tries=2 -T 5 -q "
    command = commandBase + url
    ret = call(command, shell=True)
    return (ret == 0)

def checkAllURLs(data):
    urls = []
    for (i,row) in enumerate(data):
        for url in row['urls']:
            urls.append((url,i+1))

    if urlCheckRatio < 1:
        urls = random.sample(urls,int(len(urls)*urlCheckRatio))
    p = Pool(20)
    urlValidity = p.map(wget, [u[0] for u in urls])

    urls = [u for (u,v) in zip(urls,urlValidity) if not v]
    if len(urls) > 0:
        print("%d invalid urls" % len(urls))
        for (u,i) in urls:
            print("%3d: %s" % (i,u))

    with open(url_fname,"r") as f:
        exceptions = set([u.strip() for u in f if u.strip() != ''])

    for url in urls: # invalid ones only
        if (url[0] in exceptions) and (random.random() > urlRecheckRatio):
            print("Ignoring excempt but invalid url: %s" % url[0])
        else:
            print("Error: invalid url on line %d" % (url[1]))
            print(url[0])
            cont = input('Continue? (and add)? (y/n)\n')
            if cont.lower().startswith('y'):
                if url[0] not in exceptions:
                    with open(url_fname,"a") as f:
                        f.write(url[0])
            else:
                exit(1)



# row num is from 1
pattern = r"^([^{}]+)(.+)\s*#(\w+)"
expr = re.compile(pattern)
def parseRow(line,rowNum):
    result = expr.match(line)
    if not result:
        # print("Error: can't pass line %d" % rowNum)
        return(None)
    data = {
       'text': result.groups()[0].strip(),
       'urls': [x.strip() for x in result.groups()[1].strip('{} ').split("}{") if x.strip() != ''],
       'topic': result.groups()[2].strip(),
    }

    if len(data['urls']) == 0:
        # print("Error: no URLs for line %d" % rowNum)
        # print(line)
        return(None)
    return(data)


def testParseRow():

    line = "some text {https://www.example.com/1}{https://www.example.com/2}#topic"
    data = parseRow(line,123)
    try:
        assert(data['text'] == 'some text')
        assert(data['topic'] == 'topic')
        assert(data['urls'] == ['https://www.example.com/1','https://www.example.com/2'])
    except AssertionError as e:
        print("Error: can't parse example line")
        print(line)
        pp.pprint(data)
        raise(e)

    yes = [
        "blah<b>blah</b> 123! {https://www.abc.net.au/news/2018-05-04/environment-department-to-lose-60-jobs-key-to-threatened-species/9722560}#environment",
        "blah<b>blah</b> 123! {http://www.abc.net.au/news/2018-05-04/environment-department-to-lose-60-jobs-key-to-threatened-species/9722560}{https://www.abc.net.au/news/2018-05-04/environment-department-to-lose-60-jobs-key-to-threatened-species/9722560}#environment",
    ]

    no = [
        "blah<b>blah</b> 123! #environment",
        "blah<b>blah</b> 123! {https://www.abc.net.au/news/2018-05-04/environment-department-to-lose-60-jobs-key-to-threatened-species/9722560}#",
        "blah<b>blah</b> 123! {https://www.abc.net.au/news/2018-05-04/environment-department-to-lose-60-jobs-key-to-threatened-species/9722560}",
        "blah<b>blah</b> 123! {https://www.abc.net.au/news/2018-05-04/environment-department-to-lose-60-jobs-key-to-threatened-species/9722560}env",
        "",
        " "
    ]

    for line in yes:
        assert(parseRow(line,1))

    for line in no:
        try:
            assert(parseRow(line,1) == None)
        except AssertionError as e:
            print("Error: negative parse test failed for")
            print(line)
            pp.pprint(parseRow(line,1))
            raise(e)

def readFile():
    data = []
    with open(content_fname,"r") as f:
        for (i,line) in enumerate(f):
            row = parseRow(line,i+1)
            if row == None:
                print("Error, can't parse row %d" % (i+1))
                print(line)
                exit(1)
            data.append(row)

    return(data)

def test():
    testParseRow()

def main():
    test()
    with open(template_fname,"r") as f:
        template = f.read()
    data = readFile()
    checkAllURLs(data)

    dateStr = dt.date.today().strftime('%d, %b %Y')
    output_html = Template(template).render(rows=data,date=dateStr)

    with open(output_fname,"w") as f:
        f.write(output_html)

    with open(invalidURL_fname,"w") as f:
        yaml.dump(data,f)

    print("Done")


if __name__ == "__main__":
    main()
