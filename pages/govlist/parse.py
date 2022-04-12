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
import myspellcheck

template_fname = "template.html"
content_fname = "abbott.txt"
output_fname = "stub.html"
topics_fname = 'topics.yaml'
invalidurl_excemptions_fname = "debug.yaml"
url_fname = "URLs.txt"
bad_url_excemptions_fname = "invalidURLs.yaml"
debug = True

urlCheckRatio = 0.05 # fraction of URLs to check
urlRecheckRatio = 0.01 # fraction of accepted URLs to check again

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
        urls.extend(data['urls'])

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


def readFile():
    with open(content_fname,'r') as f:
        return yaml.safe_load(f)

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
    if hashtag.lower() not in hashMap:
        print("Error: Hashtag %s is unknown" % hashtag)
        exit(1)
    return(hashMap[hashtag.lower()])

def testClassify():
    assert(topicOrder[classify('Age')] == 'Health and COVID')
    assert(topicOrder[classify('age')] == 'Health and COVID')


def test():
    testParseRow()
    testClassify()
    testStripSpace()
    teststripFancy()

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


def spellcheck(line):
    content = stripFancy(html)
    for (l,line) in enumerate(content.split('\n')):

        # awkward edge case
        # "‘can do’ capitalism; not ‘don’t do’ governments"
        # double quotes plus apostrophe hard to parse
        text = text.replace("\"‘can do’ capitalism, not ‘don’t do’ governments\"", "can do capitalism not don't do governments")
        text = text.replace('‘don’t do’', "don't do")
        text = text.replace('‘can do’', "can do")

        for word in line.split(' '):
            word = word.strip()
            if (word not in dictionary) and (word.lower() not in dictionary):
                print("Fname: " + htmlFname)
                print("Line: %d" % (l+1))
                print("Error: Word %s does not appear in the dictionary")
                answer = input("Add to dictionary? (y/n/c for keep capitalisation) ")
                if answer.lower().startswith('y'):
                    print("Adding %s to dictionary" % word.lower())
                    addToDict(word.lower())
                elif answer.lower().startswith('c'):
                    print("Adding %s to dictionary")
                    addToDict(word)
                else:
                    print("Quitting.")
                    print("Go fix line %d in file %s" % (l+1,htmlFname))



def stripFancy(text):
    expr = r'<[^<>]+>'
    text = re.sub(expr, '', text)
    expr = r'\[([^\[\]]+)\]\(([^\(\)]+)\)'
    text = re.sub(expr, r'\1', text)
    return(text)

def teststripFancy():
    original = 'asd'
    expected = 'asd'
    actual = stripFancy(original)
    assert(expected == actual)

    original = '1 <a href="123">blah</a> 2'
    expected = '1 blah 2'
    actual = stripFancy(original)
    assert(expected == actual)

    original = 'This [link](http://example.com) shows [this](./blah)'
    expected = 'This link shows this'
    actual = stripFancy(original)
    if expected != actual:
        print("actual: " + actual)
    assert(expected == actual)

def stripForSpellcheck(text):
    text = stripFancy(text);
    expr = r'\[([^\[\]]+)\]\(([^\(\)]+)\)'
    text = re.sub(expr, r'\1', text)

def testStripForSpellcheck():
    original = 'asd'
    expected = 'asd'
    actual = stripFancy(original)
    assert(expected == actual)

    original = '$5'
    expected = ''
    actual = stripFancy(original)
    assert(expected == actual)

    original = '$5,000'
    expected = ''
    actual = stripFancy(original)
    assert(expected == actual)

    original = 'Hello world!'
    expected = 'Hello world'
    actual = stripFancy(original)
    assert(expected == actual)

    original = 'Why is that? '
    expected = 'Why is that'
    actual = stripFancy(original)
    assert(expected == actual)

def addToDict(word):
    dictionary.add(word.lower())
    with open(extraWordsFname,'a') as f:
        f.write(word.lower()+'\n')

if __name__ == "__main__":
    main()
