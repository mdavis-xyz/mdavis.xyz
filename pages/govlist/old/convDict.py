import pickle

s =set()
with open('british-english') as inputFile:
    for line in inputFile:
        s.add(line.strip('\n'))

pickle.dump(s,open('words.pickle',"wb"))
