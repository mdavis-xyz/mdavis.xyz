//spellcheck.h

#ifndef SPELL_CHECK
#define SPELL_CHECK

#include "bool.h"
#define MAX_WORD_LENGTH 100


typedef struct _alphabet * Alphabet;


void checkAlphabet(void);
Alphabet alphaInit(char* fileName, bool safe);
bool checkWord(char* word, Alphabet a);
void addWord(char* word, Alphabet a, bool new);
void alphaSave(Alphabet a, char* fileName);
void clearStr(char* str);
void deleteAlphabet(Alphabet a);
bool legitWord(char* word);


#endif
