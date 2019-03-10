from mako.template import Template
import datetime as dt
import yaml
import pprint as pp
import shutil
from subprocess import call
import pypandoc
import os
import re
import myspellcheck
import sys
import argparse
import PyRSS2Gen

template_fname = "template.html"
output_fname = "pages/www/docs/index.html"
pagesFname = 'pages.yaml'
cname_fname = 'docs/CNAME'
debug = False





# today = dt.date.today()
# date = {
#    'human': today.strftime('%d, %b %Y')
# }

with open(template_fname,"r") as f:
    template = Template(f.read())

def callShellCmd(cmd,directory):
    print("Calling `%s` in %s" % (cmd,directory))
    ret = call(cmd, shell=True, cwd=directory)
    assert(not ret)
    print("Finished calling `%s` in %s" % (cmd,directory))

def numWords(markdown):
    content = myspellcheck.stripFancy(markdown)
    numWords = len([w for w in content.split(' ') if w.strip() != ''])
    print("Number of words is %d" % numWords)
    return(numWords)

def estReadingTime(fname,filetype="markdown"):
    with open(fname,'r') as f:
        original = f.read()


    if filetype.lower() == "markdown":
        markdown = original
    else:
        assert(filetype.lower() == 'html')
        markdown = pypandoc.convert_file(fname, 'md')
        with open(fname + '.md','w') as f:
            f.write(markdown)


    wpm = 265 # https://help.medium.com/hc/en-us/articles/214991667-Read-time
    minutes = numWords(markdown) / float(wpm)
    return(minutes)

def testNumWords():
    text = 'Hi [this](http://blah.com) is <i>a</i> Test!'
    expected = 5
    actual = numWords(text)
    assert(actual == expected)

def searchReplace(text,regexInfo,fileType,path):
    path = 'pages/%s/' % path
    original = text
    for r in regexInfo:
        if r['what'].lower() == fileType:
            search = loadFile(path + r['search']).rstrip('\n')
            replace = loadFile(path + r['replace']).rstrip('\n')
            print("Expression: %s" % search)
            print("Replace: %s" % replace)
            if 'test' in r:
                for t in r['test']:
                    textIn = loadFile(path + t['in']).rstrip('\n')
                    expected = loadFile(path + t['out']).rstrip('\n')

                    actual = re.sub(search, replace, textIn)
                    if actual != expected:
                        print("Input   : %s" % textIn)
                        print("Actual  : %s" % actual)
                        print("Expected: %s" % expected)
                    assert(actual == expected)
            text = re.sub(search, replace, text)
    if debug:
        diff = [(before,after) for (before,after) in zip(original.split('\n'),text.split('\n')) if before != after]
        for (before,after) in diff:
            print("Line changed from search and replace")
            print("   before: %s" % before)
            print("   after : %s" % after)
        if len(diff) == 0:
            assert(original == text)
            print("No search replace difference")
    return(text)

# data is for just this page
def doOne(data,allData,args):
    data['template'] = data['template'].lower()
    assert(data['template'] in ['none','custom','markdown','home','html'])
    if data['template'] == 'none':
        print("Skipping processing for %s" % data['path'])
    else:
        print("Processing %s" % data['title'])


        directory = 'pages/%s' % data['sourcePath']
        if data['template'] == 'home':
            data['content'] = doWWW(allData)
        elif data['template'] == 'html':
            print("Copying html")
            fname = 'pages/%s/%s' % (data['sourcePath'],data['html'])
            with open(fname,"r") as f:
                data['content'] = f.read()
            print("Estimating reading time for %s" % data['title'])
            data['estReadingTime'] = estReadingTime(fname, filetype='html')
            if 'spellcheck' in data['exclude']:
                print("Skipping spell check for %s" % data['sourcePath'])
            elif not myspellcheck.checkFile(fname):
                print("That was in %s" % fname)
                print("From doOne for html")
                exit(1)
        elif data['template'] == 'custom':
            print("Processing as custom page")
            cmd = 'python %s' % data['parseScript']
            callShellCmd(cmd,directory)
            stubFname = 'pages/%s/stub.html' % data['sourcePath']
            with open(stubFname,"r") as f:
                data['content'] = f.read()
            print("Estimating reading time for %s" % data['title'])
            data['estReadingTime'] = estReadingTime(stubFname)
            # if data['path'] == 'govlist':
            #     print("Halving abbott list reading time estimate")
            #     data['estReadingTime'] = data['estReadingTime']/2.0
        elif data['template'] == 'markdown':
            markdownFname = 'pages/%s/%s' % (data['sourcePath'],data['markdown'])
            if 'spellcheck' in data['exclude']:
                print("Skipping spell check for %s" % data['sourcePath'])
            elif not myspellcheck.checkFile(markdownFname):
                    print("That was in %s" % markdownFname)
                    print("For doOne for markdown")
                    exit(1)
            with open(markdownFname,'r') as f:
                markdown = f.read()
            if 'regex' in data:
                content = searchReplace(markdown,data['regex'],'markdown',data['sourcePath'])
            print("Converting markdown file %s to html " % markdownFname)

            data['content'] = pypandoc.convert_text(markdown, 'html', format='md')
            if 'regex' in data:
                data['content'] = searchReplace(data['content'],data['regex'],'html',data['sourcePath'])
            stubFname = 'pages/%s/stub.html' % data['path']
            with open(stubFname,'w') as f:
                f.write(data['content'])
            print("Saved markdown file to %s" % stubFname)
            if 'exclude' not in data:
                data['exclude'] = []
            print("Estimating reading time for %s" % data['title'])
            data['estReadingTime'] = estReadingTime(markdownFname)

        renderOne(data,args)

def renderOne(data,args):

        try:
            assert('title' in data)
            assert('description' in data)
            assert('images' in data)
            assert('card' in data['images'])
            assert('path' in data['images']['card'])
            assert('publishPath' in data)
            assert('sourcePath' in data)
            assert('height' in data['images']['card'])
            assert('width' in data['images']['card'])
            assert('exclude' in data)
            assert('content' in data)
            if 'date' not in data['exclude']:
                assert('date' in data)
                assert('human' in data['date'])
                assert(type(data['date']['human']) == type(''))
                assert('computer' in data['date'])
                assert(type(data['date']['computer']) == type(''))
        except AssertionError as e:
            pp.pprint({k:data[k] for k in data if k != 'content'})
            print("Error with data %s" % data['title'])
            raise(e)
        print("Rendering page %s" % data['title'])
        try:
            output = template.render(data=data,enableTracking=(args.stage_name == 'prod'))
        except TypeError as e:
            pp.pprint({k:data[k] for k in data if k != 'content'})
            print("Error processing outer template for %s" % data['title'])
            raise(e)
        outputFname = 'pages/%s/docs/index.html' % data['sourcePath']
        with open(outputFname,'w') as f:
            f.write(output)
        print("Finished rendering %s" % data['sourcePath'])

def doWWW(pages):
    print("Processing www")
    wwwTemplateFname = 'pages/www/template.html'
    with open(wwwTemplateFname, 'r') as f:
        wwwTemplate = Template(f.read())
    for page in pages:
        try:
            assert('images' in page)
            assert('card' in page['images'])
            assert('width' in page['images']['card'])
            assert('height' in page['images']['card'])
            assert('path' in page['images']['card'])
            assert('description' in page['images']['card'])
            assert('title' in page)
            assert('description' in page)
        except AssertionError as e:
            pp.pprint(page)
            print("Error with data for page %s" % page['title'])
            raise(e)
    outputHTML = wwwTemplate.render(pages=[p for p in pages if p['template'] != 'home'])

    outputFname = 'pages/www/stub.html'
    with open(outputFname,"w") as f:
        f.write(outputHTML)
    print("Finished processing www")

    return(outputHTML)

# data is for one page
def getDate(data):

    if 'date' in data:
        date = {
            'original': dt.datetime.strptime(data['date'], '%d/%m/%Y').date()
        }
        print("Reading in date as %s" % str(date['original']))
    else:
        date = {
            'original': dt.date.today()
        }
    date['human'] = date['original'].strftime('%d %b %Y').lstrip('0')
    date['computer'] = date['original'].strftime('%Y-%m-%d')


    return(date)

def loadFile(fname):
    with open(fname,'r') as f:
        data = f.read()
    return(data)

# no https://
# just www. or dev.
def getDomain(args):
    if args.stage_name == 'prod':
        CNAME = 'www.mdavis.xyz'
    else:
        CNAME = 'dev.mdavis.xyz'
    return(CNAME)

def doAll(args):
    print("Loading in %s" % pagesFname)
    with open(pagesFname,'r') as f:
        pagesData = yaml.load(f)

    print("pages data:")
    pp.pprint(pagesData)
    for page in pagesData:
        if 'path' in page:
            page['publishPath'] = page['path']
            page['sourcePath'] = page['path']
        else:
            assert('publishPath' in page)
            assert('sourcePath' in page)
        if 'exclude' not in page:
            page['exclude'] = []
        for k in ['title','description']:
            page[k] = page[k].strip()
            if ('exclude' in page) and ('spellcheck' in page['exclude']):
                print("Skipping spellcheck for %s" % page['sourcePath'])
            elif not myspellcheck.checkLine(page[k]):
                print("That was the %s %s from pages.yaml" % (k,page[k]))
                print("in doAll")
                exit(1)
        if 'disclaimer' in page:
            page['disclaimer'] = page['disclaimer'].strip()
        page['date'] = getDate(page)

    if args.only_page and not any([args.only_page in p['sourcePath'] for p in pagesData]):
        print("Error, page %s does not exist" % args.only_page)
        exit(1)

    for page in pagesData:
        if args.only_page:
            pathGetter = lambda p: p['sourcePath'] if 'sourcePath' in p else p['path']
            if pathGetter(page) in ['www',args.only_page]:
                doOne(page,pagesData,args)
            else:
                print("Skipping %s" % page['sourcePath'])
        else:
            doOne(page,pagesData,args)

    myspellcheck.init() # init again, in case we updated the dictionary earlier
    for p in pagesData:
        if (p['template'] == 'none') or ('spellcheck' in p['exclude']):
            print("Skipping spell check for %s" % p['title'])
        elif not myspellcheck.checkFile('pages/%s/docs/index.html' % p['sourcePath']):
            print("that was %s" % p['title'])
            print("Code A")
            exit(1)

    if not args.only_page:
        generateRSS(pagesData,args)

    src = 'pages/www/docs'
    dest = 'docs/'
    print("copying %s to %s" % (src,dest))
    shutil.rmtree(dest,ignore_errors=True)
    # os.makedirs(dest)
    shutil.copytree(src, dest)

    CNAME = getDomain(args)
    with open(cname_fname,'w') as f:
        f.write(CNAME)

    for page in [p for p in pagesData if p['template'] != 'home']:
        src = './pages/%s/docs' % page['sourcePath']
        dest = './docs/%s/' % page['publishPath']
        print("copying %s to %s" % (src,dest))
        shutil.copytree(src, dest)

    print("Done")

def pageToRSS(page,args):
    try:
        url = "https://%s/%s" % (getDomain(args),page['publishPath'])
        item = PyRSS2Gen.RSSItem(
            title = page['title'],
            link = url,
            description = page['description'],
            guid = PyRSS2Gen.Guid(url),
            pubDate = dt.datetime.combine(page['date']['original'], dt.datetime.min.time())
        )
    except KeyError as e:
        print("Error generating RSS entry for page")
        pp.pprint(page)
        raise(e)

    return(item)

def generateRSS(pages,args):

    print("Generating RSS file")
    data = [pageToRSS(p,args) for p in pages if p['template'].lower() != 'home']

    rss = PyRSS2Gen.RSS2(
        title = "Matthew Davis",
        link = "https://%s" % getDomain(args),
        description = "A collection of projects, stories and thoughts about technology and politics",
        lastBuildDate = dt.datetime.now(),
        items = data)

    print("Checking if the only change to RSS file is the date")

    tempFname = 'pages/www/docs/rss-temp.xml'
    publishFname = 'pages/www/docs/rss.xml'

    with open(tempFname, "w") as f:
        rss.write_xml(f)

    with open(tempFname,'r') as f:
        new = f.read()

    with open(publishFname,'r') as f:
        old = f.read()
    # just delete the date, and see if the remaining strings are equal
    # this is a really lazy way of doing this, but meh. It's good enough for now
    new = re.sub("<lastBuildDate>.*</lastBuildDate>","",new)
    old = re.sub("<lastBuildDate>.*</lastBuildDate>","",old)

    print("new xml:")
    print(new)

    if new != old:
        print("RSS feed has changed. Publish")
        with open(publishFname, "w") as f:
            rss.write_xml(f)
    else:
        print("RSS feed content has not changed. Not publishing.")

    # clean up, so we don't clutter the git repo
    os.remove(tempFname)

    print("Exported RSS file")


def test():
    testNumWords()


def arguments(argv):
    parser = argparse.ArgumentParser(description="Generate static site")
    parser.add_argument('-s', '--stage-name',
                        required=True,
                        help="deployment stage",
                        choices=['prod','dev']
                        )

    parser.add_argument('-p', '--only-page',
                        required=False,
                        help="to only update this one page (plus home page)"
                        )

    args = parser.parse_args(argv[1:])
    return(args)

if __name__ == "__main__":
   test()
   args = arguments(sys.argv)

   doAll(args)
