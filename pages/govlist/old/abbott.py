import sys
from subprocess import call
import pickle
import random
from multiprocessing import Pool

debug = True

print('starting python script')

inputFileName = 'abbott.txt'

URLlistFileName = 'urls.pickle'
dictionaryFileName = 'words.pickle'

# set to 1 to check all
urlCheckRatio = 20

# validURLs = set()
validURLs = pickle.load(open(URLlistFileName,"rb"))

dictionary = pickle.load(open(dictionaryFileName,"rb"))

def notify(msg):
    command = 'notify-send \'' + msg + '\''
    call(command, shell=True)

def saveAll():
    pickle.dump(validURLs,open(URLlistFileName,"wb"))
    pickle.dump(dictionary,open(dictionaryFileName,"wb"))

def abort(msg):
    saveAll()
    sys.exit(msg)

def indent(s,level=1):
    if debug:
        splitted = s.split('\n')
        singleIndent = '   '
        lineBegin = '\n' + singleIndent * level
        s = singleIndent + lineBegin.join(splitted)
    return s

def findOccurences(s, ch):
    return [i for i, letter in enumerate(s) if letter == ch]

def interpretLine(line):
    firstBracketIndex = line.find("{")
    if firstBracketIndex == -1:
        abort("No links on line %d" % lineNo)
    body = line[0:firstBracketIndex].strip()
    openURL = findOccurences(line, "{")
    closeURL = findOccurences(line, "}")
    urls = [line[o+1:e].strip() for o,e in zip(openURL, closeURL)]
    hashInd = line.rfind('#')
    if hashInd < closeURL[-1]:
        abort("No hash on line %d" % lineNo)
    hashtag = line[hashInd+1:].strip()
    # print("body = " + body)
    # for u in urls:
    #     print("url = " + u)
    # print("hash = #" + hashtag)

    dot = {'body': body, 'urls': urls, 'hashtag':hashtag}
    return dot

def wget(url):
    if debug:
        print('running wget on url %s' % url)
    commandBase = "wget --spider --tries=20 -T 15 -q "
    command = commandBase + url
    ret = call(command, shell=True)
    return ret

def validateURL(url):
    if (url in validURLs):
        if debug:
            print('skipping url: %s\n' % url)

        return True
    else:
        ret = wget(url)
        valid = ret == 0
        if valid:
            validURLs.add(url)
        else:
            notify('invalid url?')
            cont = input('the following url from line %d is invalid (code %d), continue (and add)? (y/n)\n%s\n' % (lineNo, ret,url))
            if(cont.lower() in ['y','yes','']):
                validURLs.add(url)
            else:
                abort("Invalid url %s\non line %d\nerror code %d" % (url, lineNo,ret))

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        pass

    try:
        import unicodedata
        unicodedata.numeric(s)
        return True
    except (TypeError, ValueError):
        pass

    return False

def spellCheck(s):
    words = s.split(' ')
    words = [w.split('-') for w in words]
    words = [item for sublist in words for item in sublist]
    words = [w.strip().replace("<i>","").replace("</i>","").replace("<b>","").replace("</b>","").strip('.,()\"`\'‘’?!*') for w in words]


    for w in words:
            if (not w in dictionary) and (not is_number(w.replace(',',"").strip('$%'))):
                if len(w) > 1:
                    wLower = w[0].lower() + w[1:]
                else:
                    wLower = w.lower()
                if not wLower in dictionary:
                    notify('unknown word')
                    ret = input('%s is not in the dictionary, add it? (y/n/c for uncapitalise) (line %d)\n' % (w,lineNo))
                    if ret.lower() in ['y','yes','']:
                        dictionary.add(w)
                    elif ret.lower() in ['c']:
                        print('adding %s to dictionary' % wLower)
                        dictionary.add(wLower)
                    else:
                        abort('Spelling error on line %d, word %s' % (lineNo, w))



def validateBody(body):
    spellCheck(body)

allTopics = {}

def getHashTitle(h):
    h = h.lower()
    if h in {"economy", "economics", "money", "tax", "economy", "budget", "housing", "costofliving", "cost of living", "finance"}:
        t = {'title':"The Economy and the Cost of Living",'priority':0}

    elif h in {"asylum", "immigration", "boats", "refugee"}:
        t = {'title':"Humanitarian Immigration and the Military",'priority':1}

    elif h in {"environment", "theenvironment", "green", "climatechange", "climate", "research", "technology", "science", "solar", "wind", "renewables", "carbon", "innovation","coal","digital"}:
        t = {'title':"Science, Technology and the Environment",'priority':2}

    elif h in {"education", "uni", "university", "school", "schools", "gonski", "tafe", "hecs", "tertiary"}:
        t = {'title':"Education",'priority':3}

    elif h in {"welfare", "equity", "homelessness","assault", "pension", "newstart"}:
        t = {'title':"Welfare and Equity",'priority':4}

    elif h in {"indigenous", "multiculturalism", "aboriginal"}:
        t = {'title':"Indigenous Affairs and Multiculturalism", 'priority':5}

    elif h in {"civil", "rights", "gay", "lgbt", "lgbti", "freedom", "freespeech", "ethics", "privacy", "metadata", "values", "terrorism", "gambling", "religion", "internetfilter", "queer","rainbow"}:
        t = {'title':"Civil Rights and Ethics", 'priority':6}

    elif h in {"army", "defence", "defense", "terror", "asio", "navy", "war", "guns", "security", "military","cybersecurity"}:
        t = {'title':"Military and Security Matters", 'priority':7}

    elif h in {"unions", "employment", "unemployment", "apprentice", "apprentices", "jobs", "wages", "workplace","union"}:
        t = {'title':"Workplace Relations and Unemployment", 'priority':8}

    elif h in {"international", "aid", "diplomacy"}:
        t = {'title':"International Relations and Diplomacy", 'priority':9}

    elif h in {"infrastructure", "nbn"}:
        t = {'title':"Infrastructure", 'priority':10}

    elif h in {"health", "hospital", "hospitals", "mental", "ndis", "disability", "drugs", "age", "aging"}:
        t = {'title':"Health", 'priority':11}

    elif h in {"abc", "sbs", "smh", "news", "corruption", "transparency", "democracy", "media"}:
        t = {'title':"Media, Corruption and Transparency", 'priority':12}
    else:
        abort('unknown tag %s on line %d' % (h,lineNo))
        return None

    allTopics[t['priority']] = t['title']
    return t

maxTopic = 12

def validateHash(h):
    return (getHashTitle(h) != None)

def validateDot(dot):
    for u in dot['urls']:
        validateURL(u)
    if debug:
        print('validating body\n')
    validateBody(dot['body'])
    if debug:
        print('validated body\n')
        print('validated hashtags\n')
    validateHash(dot['hashtag'])
    if debug:
        print('validated hashtags\n');


def renderURL(url):
    imgStr = "<img src=\"http://thesauce.co/matthew/link_icon.png\" alt=\"source\" height=\"15\" width=\"15\" />"
    lineOut = '\n'.join([
       '<a href=\"' + url +  '\">',
       indent(imgStr),
       '</a>',
       ])
    return lineOut

def renderDot(dot):
    urlStr =  '\n'.join([renderURL(u) for u in dot['urls']])
    lineOut = '\n'.join([
        '<li>',
        indent(dot['body']),
        indent(urlStr),
        '</li>',
        ])
    return lineOut

def readWholeFile(fname):
    f = open(fname,'r')
    return f.read()

def printGrouped(dots):
    if debug:
        print('alltopics: ' + str(allTopics))
    html = ''
    for topic in range(maxTopic):
        if topic in allTopics:
            html +=  '\n<br/>\n'
            html +=  ('<div id="right%d" style="display:inline">\n' % topic)
            html +=  indent(('<h3 onclick=" expandcollapsetopic(\'%d\');" style="display:inline">\n' % topic),1)
            html +=  indent('+ ' + allTopics[topic],2) + '\n'
            html +=  indent('</h3>',1) + '\n'
            html +=  '</div>\n'
            html +=  ('<div id="down%d" style="display:none">\n' % topic)
            html +=  indent(('<h3 onclick=" expandcollapsetopic(\'%d\');" style="display:inline">\n' % topic),1)
            html +=  indent('&#8210; ' + allTopics[topic],2)  + '\n'
            html +=  indent('</h3>',1) + '\n'
            html +=  '</div>\n'
            html +=  ('<div id="topic%d" style="display:none">\n' % topic)
            html +=  indent(('<ul id=l_group%d>\n' % topic),1)
            itemArray = [d['item'] for d in dots if d['group']['priority'] == topic]
            html +=  indent('\n'.join(itemArray),2)
            html +=  indent('\n</ul>',1)
            html +=  '\n</div>\n'
        else:
            print('warning: topic %d has no dots' % topic)
    return html

def printUngrouped(dots):
    html = '<ul id=l_ungrouped>\n'
    html +=   indent('\n'.join([d['item'] for d in dots]),1)
    html +=  '\n</ul>'
    return html

def genHTML(dots):
    html = readWholeFile('pythonStart.html')
    html +=  indent(printGrouped(dots),2)
    html +=  readWholeFile('pythonMid.html')
    html +=  indent(printUngrouped(dots),2)
    html +=  readWholeFile('pythonEnd.html').replace('TOTAL_NUMBER_DOT_POINTS',str(len(dots)))
    return html

def writeToFile(string,fileName):
    f = open(fileName,'w')
    f.write(string)
    f.close()

lineNo = 1

dots = []
with open(inputFileName) as inputFile:
    for line in inputFile:
        dot = interpretLine(line)
        validateDot(dot)
        if debug:
            print('validated dot\n')
        dot['item'] = renderDot(dot)
        dot['lineNo'] = lineNo
        dot['group'] = getHashTitle(dot['hashtag'])
        dots.append(dot)
        if debug:
            print(dot['item'])
        lineNo = lineNo + 1

urls = [dot['urls'] for dot in dots]
urls = [item for sublist in urls for item in sublist]

def poolURLcheck(url):
    if (random.randrange(urlCheckRatio) == 0) and not (wget(url) == 0):
        validURLs.remove(url)
        return url
    else:
        return False

p = Pool(10)

brokenURLs = [u for u in p.map(poolURLcheck,urls) if not u == False]

for u in brokenURLs:
    ret = input('broken URL found: ' + u + '\nkeep it? (y/n)\n')
    if ret.lower() in ['','y','yes']:
        validURLs.add(u)
    else:
        l = -1
        for d in dots:
            if u in d['urls']:
                l = d['lineNo']
        print('\nOther broken link: '.join(brokenURLs))
        abort('\nThis invalid url, line %d: %s' % (l,u))



html = genHTML(dots)
writeToFile(html,'./git/abbottList/pureContentAndCode.html')
writeToFile(html,'./public/pureContentAndCode.html')

ret = call('./git.sh', shell=True)
assert(not ret)

saveAll()

notify('finished abbott script')
print('done python script')
