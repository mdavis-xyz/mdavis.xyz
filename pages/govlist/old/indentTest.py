def indent(s,level):
    splitted = s.split('\n')
    lineBegin = '\n   ' * level
    s = lineBegin + lineBegin.join(splitted)
    return s
strIn = 'asdasf   <\n sdfgasdfgdf \nasdsfasdgaf\n     asdfsdagf'

print('before:\n')
print(strIn)
print('after:\n')

print(indent(strIn,1))
