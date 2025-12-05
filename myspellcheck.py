import re
import string

standardWordsFname = 'standardWords.txt'
extraWordsFname = 'extraWords.txt'

def test():
    testStripXML()
    teststripFancy()
    testStripForSpellcheck()
    testStripMarkdown()

def stripFancy(text,markdown=False):


    text = stripXML(text)
    for char in ['&ldquo;','&rdquo;','&quot;', '”', '“']:
        text = text.replace(char,'"')

    dots = '&hellip;' # ellipsis
    if text.endswith(dots):
        text = text[:-len(dots)]

    for char in [ "’", "‘"]:
        text = text.replace(char, "'")

    text = text.replace(' ', ' ') # strange space char


    if markdown:
        text = stripMarkdown(text)
    return text

def stripXML(text):

    if '<\\' in text:
        print("Probably wrong slash <\\b> instead of </b>")
        assert(False)

    # don't spell check CSS
    text = re.sub(r'<style>.*?<\/style>', ' ', text, flags=(re.DOTALL | re.MULTILINE))

    # code
    expr = r'<code>.*?</code>'
    text = re.sub(expr, ' ', text, flags=(re.DOTALL | re.MULTILINE))

    # strip any divs which are formulas
    expr = r'<div class="formula">.*?</div>'
    text = re.sub(expr, ' ', text, re.MULTILINE)
    expr = r'<span class="formula">.*?</span>'
    text = re.sub(expr, ' ', text, re.MULTILINE)
    expr = r'<sub>.*?</sub>'
    text = re.sub(expr, ' ', text)
    expr = r'<[^<>]+>'
    text = re.sub(expr, '', text)



    # hard code the paraphrase in the voting page
    expr = r'Every single one of \[the tested machines\] had some sort of weakness'
    text = re.sub(expr, 'Every single one of the tested machines had some sort of weakness', text)
    return text

def testStripXML():
    text = 'This is <div class="something">not a</div> formula and this is <div class="something">not a</div> formula'
    expected = 'This is not a formula and this is not a formula'
    actual = stripXML(text)
    assert(actual == expected)

    text = 'This is <div class="formula">definitely <i>a</i></div> formula'
    expected = 'This is   formula'
    actual = stripXML(text)
    if actual != expected:
        print("Text:     %s" % text)
        print("Expected: %s" % expected)
        print("Actual:   %s" % actual)
    assert(actual == expected)

    text = 'This is <span class="formula">definitely a</span> formula'
    expected = 'This is   formula'
    actual = stripXML(text)
    if actual != expected:
        print("Text:     %s" % text)
        print("Expected: %s" % expected)
        print("Actual:   %s" % actual)
    assert(actual == expected)

def stripMarkdown(text):

    expr = r'```(\n[^`]+\n)```\n'
    for _ in range(text.count("```") // 2 + 1):
        text = re.sub(expr, '', text, re.MULTILINE)

    lines = text.split('\n')
    newLines = []
    for line in lines:

        # an image inside a link
        # e.g. [ ![xkcd comic about voting security](images/xkcd-blockchain.png) ](https://xkcd.com/2030/)

        expr = r'\[\s*!\[([^\]]+)\]\([^\)]+\)\s*\]\([^\)]+\)' # markdown images
        line = re.sub(expr, r'\1', line)

        # hard code quote from voting page
        # where I want to paraphrase
        expr = r'Every single one of \[the tested machines\] had some sort of weakness'
        line = re.sub(expr, r'Every single one of the tested machines had some sort of weakness', line)

        expr = r'!\[([^\[\]]+)\]\(([^\)\(]+)\)({[^}{]+})?' # markdown images
        line = re.sub(expr, r'[\1](\2)', line)
        expr = r'\[([^\[\]]+)\]\(([^\(\)]+)\)' # links
        line = re.sub(expr, r'\1', line)
        if (line.count('*') % 2) and line.lstrip().startswith('* '):
            # odd number of *
            expr = r'^\s*\*' # dot list
            line = re.sub(expr, r'', line)
        expr = r'\*\*([^\*]+)\*\*' # bold
        line = re.sub(expr, r'\1', line)
        expr = r'\*([^*]+)\*' # italics
        line = re.sub(expr, r'\1', line)
        expr = r'`([^`]+)`' # ignore code inline
        line = re.sub(expr, '', line)
        expr = r'^\s*>([^<>]*)$' # quote
        line = re.sub(expr, r'\1', line)
        expr = r'^\s*&gt;([^<>]*)$' # quote
        line = re.sub(expr, r'\1', line)
        expr = r'^\s*#+([^#]+)$' # heading
        line = re.sub(expr, r'\1', line)
        expr = r'\b:::\b' # custom class for markdown table
        line = re.sub(expr, r'', line)
        expr = r'^:::.*$' # custom class for warnings
        line = re.sub(expr, r'', line)
        expr = r'^<[^>]+>\s*$' # URLs
        line = re.sub(expr, r'', line)
        

        newLines.append(line)
    return '\n'.join(newLines).strip()

def testStripMarkdown():
    text = "* this is a *italics* in a line"
    expected = "this is a italics in a line"
    actual = stripMarkdown(text)
    if expected != actual:
        print("Input text: %s" % text)
        print("Expected: %s" % expected)
        print("Actual: %s" % actual)
    assert(actual == expected)

    text = "this is a *italics* in a line"
    expected = "this is a italics in a line"
    actual = stripMarkdown(text)
    if expected != actual:
        print("Input text:\n%s" % text)
        print("Expected:\n%s" % expected)
        print("Actual:\n%s" % actual)
    assert(actual == expected)

    text = "*this* is italics at the start"
    expected = "this is italics at the start"
    actual = stripMarkdown(text)
    if expected != actual:
        print("Input text:\n%s" % text)
        print("Expected:\n%s" % expected)
        print("Actual:\n%s" % actual)
    assert(actual == expected)


    text = "This is an ![image](path)"
    expected = "This is an image"
    actual = stripMarkdown(text)
    if expected != actual:
        print("Input text:\n%s" % text)
        print("Expected:\n%s" % expected)
        print("Actual:\n%s" % actual)
    assert(actual == expected)


    text = "This is an ![image](path){.myclass}"
    expected = "This is an image"
    actual = stripMarkdown(text)
    if expected != actual:
        print("Input text:\n%s" % text)
        print("Expected:\n%s" % expected)
        print("Actual:\n%s" % actual)
    assert(actual == expected)

    text = "So if you're trying to enumerate a long list of resources, the paginator will provides an easier way to fetch chunk after chunk of the resource list, compared to raw `list_` calls."
    expected = "So if you're trying to enumerate a long list of resources, the paginator will provides an easier way to fetch chunk after chunk of the resource list, compared to raw  calls."
    actual = stripMarkdown(text)
    if expected != actual:
        print("Input text:\n%s" % text)
        print("Expected:\n%s" % expected)
        print("Actual:\n%s" % actual)
    assert(actual == expected)


def teststripFancy():
    original = 'asd'
    expected = 'asd'
    actual = stripFancy(original)
    assert(expected == actual)

    original = '1 <a href="123">blah</a> 2'
    expected = '1 blah 2'
    actual = stripFancy(original)
    assert(expected == actual)

    original = '1 <a\nhref="123">blah</a> 2'
    expected = '1 blah 2'
    actual = stripFancy(original)
    assert(expected == actual)

    original = 'This [link](http://example.com) shows [this](./blah)'
    expected = 'This link shows this'
    actual = stripFancy(original,markdown=True)
    if expected != actual:
        print("actual: " + actual)
    assert(expected == actual)

    original = 'This *is* italics'
    expected = 'This is italics'
    actual = stripFancy(original,markdown=True)
    if expected != actual:
        print("actual: " + actual)
    assert(expected == actual)

    original = 'This **is bold** yes'
    expected = 'This is bold yes'
    actual = stripFancy(original,markdown=True)
    if expected != actual:
        print("actual: " + actual)
    assert(expected == actual)

    original = 'Here <code>blah</code> and more <code>stuff x=1</code>'
    expected = 'Here   and more  '
    actual = stripFancy(original, markdown=False)
    if expected != actual:
        print(f"original: {original}")
        print(f"actual  : {actual}")
        print(f"expected: {expected}")
    assert(expected == actual)


    original = 'Here <code>bl\nah</code> done'
    expected = 'Here   done'
    actual = stripFancy(original, markdown=False)
    if expected != actual:
        print(f"original: {original}")
        print(f"actual  : {actual}")
        print(f"expected: {expected}")
    assert(expected == actual)

    original = 'Here <code>blah</code> and more <code>stuff\n x=1</code>'
    expected = 'Here   and more  '
    actual = stripFancy(original, markdown=False)
    if expected != actual:
        print(f"original: {original}")
        print(f"actual  : {actual}")
        print(f"expected: {expected}")
    assert(expected == actual)

    original = '<li><code>lambda</code> is what you would pass to <code>boto3.client()</code></li>'
    expected = '  is what you would pass to  '
    actual = stripFancy(original, markdown=False)
    if expected != actual:
        print(f"original: {original}")
        print(f"actual  : {actual}")
        print(f"expected: {expected}")
    assert(expected == actual)

def stripForSpellcheck(word):
    word = stripFancy(word)
    word = word.rstrip(',')
    word = word.strip().rstrip('.?!')

    if word.endswith("™") or word.endswith(":"):
        word = word[:-1]

    expr = [
        r"^\$?-?\d+((\,\d{3})+)?(\.\d+)?$", # numbers (including negative)
        r"^\$?\d+((\,\d{3})+)?(\.\d+)?[BMk]?$", # numbers and dollars
        r"^\d+(\.\d+)?[kMG]?W$", # 1.2GW
        r"^\d+(\.\d+)?[kMG]?Bi\/s$", # 25MBi/s
        r"^\d+((\,\d{3})+)?(\.\d+)?%$", #percentage
        r"^\d{1,2}(:\d{2})?[ap]m$", # time
        r"^\d+\/\d+$", # fractions
        r"^\d+-\d+$", # 2016-2017
        r"^\d{2,4}-\d{1,2}-\d{1,2}$", # 2016-01-02
        r"^\d{1,2}:\d{1,2}(:\d{1,2})?$", # 12:34:13
        r"^(\d+\.?)+$", # 12.1.3
        r"^\+[\+-]+\+$", # markdown table
    ]

    for e in expr:
        word = re.sub(e, '', word)

    if any(word.endswith(c) for c in ";™:\""):
        word = word[:-1]
    if any(word.startswith(c) for c in "\""):
        word = word[1:]

    return word

def testStripForSpellcheck():
    original = 'asd'
    expected = 'asd'
    actual = stripForSpellcheck(original)
    assert(expected == actual)

    original = 'asd,'
    expected = 'asd'
    actual = stripForSpellcheck(original)
    assert(expected == actual)

    for original in ['$5','123.0','$500,300.12','$5.3M', \
                     '25MBi/s','6am','12:30pm','2016-2017',\
                     '2017-01-2','12:34','13:34:01',
                     '12.2', '13.3.5.']:
        expected = ''
        actual = stripForSpellcheck(original)
        if expected != actual:
            print("original: %s" % original)
            print("Expected: %s" % expected)
            print("Actual: %s" % actual)
        assert(expected == actual)

    original = 'hello123'
    expected = 'hello123'
    actual = stripForSpellcheck(original)
    assert(expected == actual)

    original = 'world!'
    expected = 'world'
    actual = stripForSpellcheck(original)
    assert(expected == actual)

    original = '<i>why</i>? '
    expected = 'why'
    actual = stripForSpellcheck(original)
    assert(expected == actual)

    original = '"hello'
    expected = 'hello'
    actual = stripForSpellcheck(original)
    assert(expected == actual)


dictionary = None
def init():
    global dictionary
    # initialise dictionary stuff
    with open(standardWordsFname,'r') as f:
        words = [w.strip() for w in f]

    with open(extraWordsFname,'r') as f:
        words += [w.strip() for w in f]

    dictionary = set(words)
    assert 'spent' in dictionary


def addToDict(word):
    print("Adding %s to dictionary" % word)
    dictionary.add(word)
    with open(extraWordsFname,'a') as f:
        f.write(word+'\n')

# is a string a number?
def is_number(s):
    try:
        float(s)
    except ValueError:
        return False
    else:
        return True

def word_wrapped_by(word, start, end=None):
    if end is None:
        return word_wrapped_by(word, start, end=start)
    elif len(word) < 3:
        return False
    else:
        return (word[0] == start) and (word[-1] == end)

def checkWord(word):

    if (word != '') and (word not in dictionary) and (word.lower() not in dictionary):
        if word.endswith("'s") or word.endswith("s'"):
            if (word[:-2] in dictionary) or (word[:-2].lower() in dictionary):
                return True
        elif word.endswith('s') and ((word[:-1].lower() in dictionary) or (word[:-1] in dictionary)):
            return True
        if ('-' in word) and ('--' not in word) and (word.strip('-') == word):
            subwords = word.split('-')
            if all([(w in dictionary) or (w.lower() in dictionary) for w in subwords]):
                return True
        if word.endswith('...') and word[:-3] in dictionary:
            # e.g. hello world...
            return True
        elif word.endswith('…') and word[:-1] in dictionary:
            # e.g. hello world...
            return True
        elif is_number(word):
            return True
        elif word_wrapped_by(word, "(", ")"):
            return checkWord(word[1:-1])
        elif word_wrapped_by(word, "'", "'"):
            return checkWord(word[1:-1])
        elif word_wrapped_by(word, '"', '"'):
            return checkWord(word[1:-1])
        elif word_wrapped_by(word, '_', '_'):
            return checkWord(word[1:-1])
        elif word_wrapped_by(word, '*', '*'):
            return checkWord(word[1:-1])

        # this might not pick up unmatched parens
        # but otherwise we'll detect a lot of words inside parens whose other we can't match
        elif word.startswith("(") and word[1] in string.ascii_letters + string.digits:
            return checkWord(word[1:])
        elif (word.endswith(".)") or word.endswith("?)")) and word[-3] in string.ascii_letters + string.digits:
            return checkWord(word[:-2])
        elif word.endswith(")") and word[-2] in string.ascii_letters + string.digits:
            return checkWord(word[:-1])

        print("Error: word %s does not appear in the dictionary" % word)
        if word != word.lower():
           print("   y - add, lowercase %s" % word.lower())
           print("   Y - add, as is %s" % word)
        else:
           print("   y - add as is %s" % word.lower())

        if word.endswith("'s") or word.endswith("s'"):
            print("   a - add lowercase without apostrophe: %s" % word[:-2].lower())
            print("   A - add without apostrophe: %s" % word[:-2])
        elif word.endswith("s"):
            print("   p - add singular lowercase: %s" % word[:-1].lower())
            if word != word.lower():
                print("   P - add singular as is : %s" % word[:-1])
        
        print("   n - don't add. Exit")
        answer = input('')
        if answer.startswith('y'):
            addToDict(word.lower())
        elif answer.startswith('Y'):
            addToDict(word)
        elif answer.startswith('a'):
            addToDict(word[:-2].lower())
        elif answer.startswith('A'):
            addToDict(word[:-2])
        elif answer.startswith('p'):
            addToDict(word[:-1].lower())
        elif answer.startswith('P'):
            addToDict(word[:-1])
        else:

            return False
    return True

def checkLine(line,markdown=False):

    original_line = line

    # awkward edge case
    # "‘can do’ capitalism; not ‘don’t do’ governments"
    # double quotes plus apostrophe hard to parse
    line = line.replace("\"‘can do’ capitalism, not ‘don’t do’ governments\"", "can do capitalism not don't do governments")
    line = line.replace("\"'can do' capitalism, not 'don't do' governments\"", "can do capitalism not don't do governments")
    line = line.replace('‘don’t do’', "don't do")
    line = line.replace('‘can do’', "can do")

    # deliberate typos
    line = line.replace('There are spelling mistakes, such as "Photovoltalic" and "Natrual Gas"', '')
    line = line.replace('There are spelling mistakes, such as "Photovoltalic" and "Natrual', '') # linebreak in the HTML

    # awkward double-paren
    line = line.replace('[zero-day exploits](https://en.wikipedia.org/wiki/Zero-day_(computing))', '')
    line = line.replace('[a tool](https://markets-portal-help.docs.public.aemo.com.au/Content/EMMScommon/AboutConstraints.html?TocPath=Energy%20Market%20Management%20System%20(EMMS)%7CMarket%20Info%7CAbout%20Constraints%7C_____0)', '')

   
    # the line is just a markdown URL
    expr = r"<http[^>]+>"
    line = re.sub(expr, r' ', line)

    line = stripFancy(line,markdown=markdown)

    # remove brackets
    expr = r'\(([^\(\)]+)\)'
    line = re.sub(expr, r'\1', line)

    # remove brackets
    expr = r'"([^"]+)"'
    line = re.sub(expr, r'\1', line)

    # remove brackets
    expr = r"\s'([^']+)'[\s,.!?]"
    line = re.sub(expr, r' \1 ', line)

    # custom classes for tables
    expr = r"\b:::\b"
    line = re.sub(expr, r' ', line)


    # e.g. 4:00-4:05
    exprs = [
        r"\d{1,2}:\d{1,2}:\d{1,2}",
        r"\d{1,2}:\d{1,2}",
        r"\d{1,2}:\d{1,2}-\d{1,2}:\d{1,2}",
    ]
    for expr in exprs:
        line = re.sub(expr, r' ', line)


    words = [w.strip() for w in line.split(' ') if w.strip() != '']
    for w in words:
        if w not in dictionary:
            if w.startswith('r/'):
                breakpoint()
            for ws in w.split('/'):
                if not checkWord(stripForSpellcheck(ws)):
                    return False
    return True

def checkFile(fname):
    with open(fname,'r') as f:
        content = f.read()
    markdown=(fname.endswith('.md'))
    if markdown:
        print("Passing markdown flag from checkFile to stripFancy")

    content = stripFancy(content,markdown=markdown)
    lines = content.split('\n')
    for (i,line) in enumerate(lines):
        if not checkLine(line):
            print("Quitting")
            print("That was file %s line %d" % (fname,i+1))
            print(line)
            print("The surrounding lines were:")
            for (j, other_line) in enumerate(lines):
                if (i - 5 <= j) and (j <= i + 5):
                    print(other_line)
                    
            return False
    return True
test()
init()
