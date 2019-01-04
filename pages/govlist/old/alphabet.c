#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>
#include "bool.h"
#include "alphabet.h"

#define ALPHABET_SIZE (256)

//including numbers and apostrophe
#define READ "r"
#define WRITE "w"
#define APPEND "a"
#define BYTE (0xFF)

#include "debug.h"

#define MAX_URL_LENGTH 500
#define MAX_STR_LENGTH (safeMode?MAX_WORD_LENGTH:MAX_URL_LENGTH)

//check words are legitimate or not
bool safeMode=TRUE;//true by default

typedef struct _alphabet{
   Alphabet links[ALPHABET_SIZE];
   bool valid;
   bool new;
} alphabet;

void clearStr(char* str);
unsigned int charToNum(char c);
char numToChar(unsigned int num);
bool legitChar(char c);
void checkHash(void);

void alphaSaveRec(char* preStr, Alphabet a, FILE* f);





Alphabet newAlphabet(void){
   Alphabet a=(Alphabet) malloc(sizeof(alphabet));
   a->valid=FALSE;
   int i;
   for(i=0; i<ALPHABET_SIZE; i++){
      a->links[i]=NULL;
   }
   a->new=FALSE;
   return a;
}

void checkAlphabet(void){
   #ifdef DEBUG
   printf("checking hash\n");
   checkHash();
   #endif
   #ifdef DEBUG
   printf("initialising\n");
   #endif
   Alphabet a=alphaInit("/usr/share/dict/words",TRUE);
   assert(checkWord("Alcott",a));
   assert(!checkWord("zsahjfkl",a));
   #ifdef DEBUG
   printf("saving\n");
   #endif
   alphaSave(a,"test.txt");
   assert(checkWord("",a));
   deleteAlphabet(a);
   printf("done testing\n");
   
   
}

Alphabet alphaInit(char* fileName, bool safe){
   safeMode=safe;
   FILE* f=fopen(fileName, READ);
   if(f==NULL){
      printf("error - couldn't open file to read in alphabet: %s\n", fileName);
      abort();
   }
   char word[MAX_STR_LENGTH];
   Alphabet a=newAlphabet();
   a->valid=TRUE;//"" is a string
   char c=fgetc(f);
   int i;
   while(c!=EOF){
      for(i=0; i<MAX_STR_LENGTH; i++){
         word[i]='\0';
      }
      i=0;
      while(c!=EOF && c!='\n'){
         assert(i<MAX_STR_LENGTH);
         //if(!(c=='\'' || ('a'<=c && c<='z') || ('A'<=c && c<='Z'))){
         //   printf("error - read in char c=%c=%d\n",c,(int)c);
         //   abort();
         //}
         word[i]=c;
         i++;
         c=fgetc(f);
         
      }
      if(!safeMode || legitWord(word)){
         #ifdef DEBUG
            if(!safeMode){
               printf("adding '%s' in initialisation, not in safeMode\n", word);
            }
         #endif
         addWord(word, a, FALSE);
      }else{
         #ifdef DEBUG
            if(!safeMode){
               printf("Skipping initial adding of word '%s' in unsafe mode\n",word);
            }
         #endif
      }
      
      if(c!=EOF){
         c=fgetc(f);
      }
   }
   fclose(f);
   return a;
}


bool checkWord(char* word, Alphabet a){
   assert(word!=NULL);
   assert(a!=NULL);
   char c=*word;
   assert(legitChar(c));
   if(*word=='\0'){
      return (a->valid);
   }else if(a->links[charToNum(c)]==NULL){
      return FALSE;
   }else{
      return checkWord(word+1,a->links[charToNum(c)]);
   }
   //return (*word=='\0' && a->valid) || (a->links[charToNum(c)]!=NULL && checkWord(word+1,a->links[charToNum(c)]));
}
void addWord(char* word, Alphabet a, bool new){
   assert(a!=NULL);
   assert(word!=NULL);
   #ifdef DEBUG
      if(safeMode){
         if(!legitWord(word)){
            printf("adding a non-legit word in safeMode: '%s'\n",word);
            abort();
         }
      }
   #endif
   if(*word=='\0'){
      a->valid=TRUE;
      a->new = a->new || new;
   }else{
      if(a->links[charToNum(*word)]==NULL){
         a->links[charToNum(*word)]=newAlphabet();   
      }
      addWord(word+1,a->links[charToNum(*word)],new);
   }
}
void alphaSave(Alphabet a, char* fileName){
   assert(a!=NULL);
   assert(fileName!=NULL);
   FILE* f=fopen(fileName, APPEND);
   assert(f!=NULL);
   char word[MAX_STR_LENGTH];
   clearStr(word);
   alphaSaveRec(word,a, f);
   fclose(f);
}

void alphaSaveRec(char* preStr, Alphabet a, FILE* f){
   assert(f!=NULL);
   assert(a!=NULL);
   assert(preStr!=NULL);
   if(a->valid && a->new){
      fprintf(f,"%s\n",preStr);
   }
   int i;
   int l=strlen(preStr);   
   for(i=0; i<ALPHABET_SIZE; i++){
      preStr[l]=numToChar(i);
      preStr[l+1]='\0';
      if(a->links[i]!=NULL){
         alphaSaveRec(preStr,a->links[i],f);
      }
   }
}

void clearStr(char* str){
   assert(str!=NULL);
   if(*str!='\0'){
      *str='\0';
      clearStr(str+1);
   }
}

bool legitChar(char c){
   return !safeMode || c=='\0' || ('a'<=c && c<='z') || ('A'<=c && c<='Z') || ('0'<=c && c<='9') || c=='\'' || c=='$' || c=='.';
}
unsigned int charToNum(char c){
   return ((unsigned int) c) & BYTE;
}
char numToChar(unsigned int num){
   num &= BYTE;
   return (char) num;
}

void checkHash(void){
   unsigned int i;
   for(i=0; i<ALPHABET_SIZE; i++){
      if(i!=charToNum(numToChar(i))){
         printf("hash is not reversable\n");
         printf("num=%u\nnumToChar(num)=%u\ncharToNum(numToChar(num)=%u\n",i,numToChar(i),charToNum(numToChar(i)));
         printf("hash is not reversable\n");
         abort();
      }
   }
   for(i='a'; i<='z'; i++){
      assert(legitChar(i));
   }
   for(i='A'; i<='Z'; i++){
      assert(legitChar(i));
   }
   for(i='0'; i<='9'; i++){
      assert(legitChar(i));
   }
   assert(legitChar('\''));
   for(i=0; i<128; i++){
      if(legitChar(i) && i!='\0'){
         assert(numToChar(charToNum(i))==i);
      }
   }
   assert(!legitChar('['));
   
}

bool legitWord(char* word){
   assert(word!=NULL);

   //check $ signs
   int i;
   for(i=1; i<strlen(word); i++){
      if(word[i]=='$'){
         return FALSE;
      }
   }
   return *word=='\0' || (legitChar(*word) && legitWord(word+1));
}

void deleteAlphabet(Alphabet a){
   assert(a!=NULL);
   int i;
   for(i=0; i<ALPHABET_SIZE; i++){
      if(a->links[i]!=NULL){
         deleteAlphabet(a->links[i]);
      }
   }
   free(a);
}
