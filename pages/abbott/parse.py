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
topics_fname = 'topics.yaml'
invalidurl_excemptions_fname = "debug.yaml"
url_fname = "URLs.txt"
bad_url_excemptions_fname = "invalidURLs.yaml"
debug = True

urlCheckRatio = 0.05 # fraction of URLs to check
urlRecheckRatio = 0.01 # fraction of except URLs to check again

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

    with open(url_fname,"r") as f:
        prevURLs = set([x.strip() for x in f])


    if urlCheckRatio < 1:
        newURLs = [u for u in urls if u not in prevURLs]
        oldURLs = [u for u in urls if u in prevURLs]
        urls = random.sample(oldURLs,int(len(oldURLs)*urlCheckRatio))

    p = Pool(20)
    urlValidity = p.map(wget, [u[0] for u in urls])

    with open(url_fname,"a") as f:
        for (u,v) in zip(urls,urlValidity):
            if v and (u not in prevURLs):
                f.append(u+'\n')

    urls = [u for (u,v) in zip(urls,urlValidity) if not v]
    if len(urls) > 0:
        print("%d invalid urls" % len(urls))
        for (u,i) in urls:
            print("%3d: %s" % (i,u))


    for url in urls: # invalid ones only
        if (url[0] in prevURLs) and (random.random() > urlRecheckRatio):
            print("Ignoring excempt but invalid url: %s" % url[0])
        else:
            print("Error: invalid url on line %d" % (url[1]))
            print(url[0])
            cont = input('Continue? (and add)? (y/n)\n')
            if cont.lower().startswith('y'):
                if url[0] not in exceptions:
                    with open(url_excemptions_fname,"a") as f:
                        f.write(url[0] + '\n')
            else:
                exit(1)



# row num is from 1
pattern = r"^([^{}]+)(.+)\s*#(\w+)$"
expr = re.compile(pattern)
def parseRow(line,rowNum):
    result = expr.match(line)
    if not result:
        # print("Error: can't pass line %d" % rowNum)
        return(None)
    data = {
       'text': result.groups()[0].strip(),
       'urls': [x.strip() for x in result.groups()[1].strip('{} ').split("}{") if x.strip() != ''],
       'hashTag': result.groups()[2].strip(),
       'topic': classify(result.groups()[2].strip())
    }

    if len(data['urls']) == 0:
        # print("Error: no URLs for line %d" % rowNum)
        # print(line)
        return(None)
    return(data)


def testParseRow():

    line = "some text {https://www.example.com/1}{https://www.example.com/2}#age"
    data = parseRow(line,123)
    try:
        assert(data['text'] == 'some text')
        assert(topicOrder[data['topic']] == 'Health')
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


def initTopics():
    with open(topics_fname,'r') as f:
        data = yaml.safe_load(f)

    # hashMap is a dict, takes in a hash tag, returns topic id
    # topicOrder is a list of topics
    topicOrder = []
    hashMap = {}
    for (i,topicDict) in enumerate(data):
        assert(len(topicDict) == 1)
        topicName = list(topicDict.keys())[0]
        topicOrder.append(topicName)
        for tag in topicDict[topicName]:
            hashMap[tag.lower()] = i

    return(hashMap,topicOrder)

(hashMap,topicOrder) = initTopics()

# returns the index of the related topic
def classify(hashtag):
    return(hashMap[hashtag.lower()])

def testClassify():
    assert(topicOrder[classify('Age')] == 'Health')
    assert(topicOrder[classify('age')] == 'Health')


def test():
    testParseRow()
    testClassify()
    testStripSpace()

def stripSpace(text):
    newLines = []
    for line in text.split('\n'):
        newLine = ' '.join([w for w in line.split(' ') if w.strip() != ''])
        if newLine.strip() != '':
            newLines.append(newLine)
    newText = '\n'.join(newLines)
    return(newText)
    # text = re.sub(r" {2,}"," ",text, re.MULTILINE)
    # text = re.sub(r" +\n","\n",text, re.MULTILINE)
    # text = re.sub(r"\n +","\n",text, re.MULTILINE)
    # return(text)
    # array = text.split('  ')
    # print(array)
    # joined = ' '.join([a.strip(' ') for a in array if a.strip() != ''])
    # array = text.split('\n')
    # joined = '\n'.join([a.strip(' ') for a in array if a.strip() != ''])
    # return(joined)

def testStripSpace():
    inText = 'a b  c \n   d e\n\nf\n \ng'
    expected = 'a b c\nd e\nf\ng'
    actual = stripSpace(inText)
    if expected != actual:
        print("Expected: " + expected)
        print("Actual: " + actual)
    assert(expected == actual)


def main():
    test()
    with open(template_fname,"r") as f:
        template = f.read()
    data = readFile()
    checkAllURLs(data)

    dateStr = dt.date.today().strftime('%d, %b %Y')
    output_html = Template(template).render(rows=data,date=dateStr,topics=topicOrder)

    output_html = stripSpace(output_html)

    with open(output_fname,"w") as f:
        f.write(output_html)

    with open(invalidurl_excemptions_fname,"w") as f:
        yaml.dump(data,f)

    print("Done")


if __name__ == "__main__":
    main()
