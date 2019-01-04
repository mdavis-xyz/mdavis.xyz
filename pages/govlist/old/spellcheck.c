//spellcheck.c

#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>
#include "bool.h"
#include "alphabet.h"
#include "debug.h"


#define READ "r"
#define WRITE "w"

#define BIG 100

char toLower(char c);

bool aNumber(char* word);
void checkANumber(void);

void removeFullStop(char* word);

//argv[1]=text doc
//argv[2]=dictionary file
int main(int argc, char* argv[]){

   assert(argc==3);
   assert(argv[1]!=NULL);
   assert(argv[2]!=NULL);

   char* inputFile=argv[1];
   char* dictionaryFile=argv[2];

   printf("starting spellcheck\n");
   char* test=malloc(BIG);
   strncpy(test,"a</b>",BIG);
   removeFullStop(test);
   assert(strcmp(test,"a")==0);
   strncpy(test,"a.</b>",BIG);
   removeFullStop(test);
   assert(strcmp(test,"a")==0);
   
/*
   if(argc!=1){
      printf("Provide the input file as the first argument\n");
      abort();
   }
   assert(argv[0]!=NULL);*/
   char scannedWord[MAX_WORD_LENGTH]={0};
   FILE* f=fopen(inputFile,READ);
   if(f==NULL){
      printf("error-can't open file %s\n",inputFile);
   }
   checkAlphabet();
   checkANumber();
   int line=0;
   char c=fgetc(f);
   char word[MAX_WORD_LENGTH];
   clearStr(word);
   Alphabet a=alphaInit(dictionaryFile, TRUE);
   addWord("abandoned",a,FALSE);		
   assert(checkWord("abandoned",a));
   int i;
   #ifdef DEBUG
      printf("reading in abbott.txt\n");
   #endif
   //int j;
   while(c!=EOF){
      line++;
      c=toLower(c);
      while(c!='{' && c!=EOF){
         clearStr(word);
         i=0;
         #ifdef DEBUG
            //printf("At start of line %d\n",line);
         #endif
         while(c!='{' && c!=' ' && c!=EOF){
            if(i>=MAX_WORD_LENGTH){
               printf("error - misread word on line %d\n",line);
               printf("word greater than %d characters long\n",MAX_WORD_LENGTH);
               abort();
            }
            word[i]=c;
            c=fgetc(f);
            i++;
            #ifdef DEBUG
            //   printf("%d - %c\n", i,c);
               //putchar(c);
            #endif
         }
         #ifdef DEBUG
            printf("word=%s\n",word);
         #endif
         *word=toLower(*word);
         removeFullStop(word);
         if(legitWord(word) && !checkWord(word,a) && !aNumber(word)){
            printf("Spellcheck - '%s' in line %d is not currently a word. Add it? (Y/N)\n",word,line);
            assert(-1!=system("notify-send \"Spellcheck\" \"Unknown word\""));
            clearStr(scannedWord);
            //j=0;
            //while((scannedWord[j]=getchar())!='\n' && scannedWord[j]!=' '){
            //   j++;
            //}
            assert(scanf("%s",scannedWord)==1);
            #ifdef DEBUG
               printf("Scanned in %s\n",scannedWord);
            #endif
            if(toLower(scannedWord[0])!='y'){
               printf("saving current dictionary\n");
               alphaSave(a,dictionaryFile);
               (void) getchar();
               printf("waiting for you to change abbott.txt. \nPress any character key to continue\n");
               (void) getchar();
               return main(argc,argv);
            }else{
               #ifdef DEBUG
                  printf("Adding word: %s\n", word);
               #endif
               addWord(word,a,TRUE);
            }
         
         }
         c=fgetc(f);
      }
      #ifdef DEBUG
         printf("skipping URL\n");
      #endif
      assert(c==EOF || c=='{');
      while(c!=EOF && c!='\n'){
         c=fgetc(f);
      }
      if(c!=EOF){
      	assert(c=='\n');
      	c=fgetc(f);
      }
   }
   fclose(f);
   alphaSave(a,dictionaryFile);
   deleteAlphabet(a);
   printf("spellcheck complete\n");
   return EXIT_SUCCESS;
}

char toLower(char c){
   if('A'<=c && c<='Z'){
      return c-'A'+'a';
   }else{
      return c;
   }
}

bool aNumber(char* word){
   assert(word!=NULL);
   unsigned int numDots=0;
   unsigned int numLetters=0;
   unsigned int numDigits=0;
   if(*word=='$'){
      word++;
   }
   while(*word!='\0'){
      if(*word=='.'){
         numDots++;
      }else if(('a'<=*word && *word<='z') || ('A'<=*word && *word<='Z')){
         numLetters++;
      }else if('0'<=*word && *word<='9'){
         numDigits++;
      }else{
         return FALSE;
      }
      word++;
   }
   return (numDots<=1 && numLetters==0);
}

void checkANumber(void){
   assert(aNumber("123"));
   assert(aNumber("12.3"));
   assert(!aNumber("1.2.3"));
   assert(aNumber("$123"));
   assert(aNumber("$12.3"));
   assert(!aNumber("$1a.3"));
   assert(!aNumber("1#3"));
}

void removeFullStop(char* word){
   assert(word!=NULL);
   if(strcmp(word,".</b>")==0){
      word[0]='\0';
      word[1]='\0';
      word[2]='\0';
      word[3]='\0';
      word[4]='\0';
   }else if(strcmp(word,"</b>")==0){
      word[0]='\0';
      word[1]='\0';
      word[2]='\0';
      word[3]='\0';
   }else if(word[0]=='\0'){
      return;
   }else if(word[1]=='\0'){
      if(word[0]=='.'){
         word[0]='\0';
      }
   }else{
      removeFullStop(word+1);
   }
}
