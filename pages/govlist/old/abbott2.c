#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <time.h>
#include <ctype.h>
#include "bool.h"
#include "dotPoint.h"
#include "alphabet.h"
#include "debug.h"

#define READ "r"
#define WRITE "w"
#define APPEND "a"

//comment out to print the ungrouped list in chronological order
#define UNGROUPED_REV_CHRONO

//comment out to print groups in chronological order
#define GROUP_REV_CHRONO

#define BUFF_SIZE 10000

//dot every PROG_DOTS lines
#define PROG_DOTS 20

#ifdef DEBUG
   #define URL_CHECK_CMD "wget --spider --tries=20 -T 30 " //no quiet flag
#else
   #define URL_CHECK_CMD "wget --spider --tries=10 -T 15 -q "
#endif


#define START_FILE "groupStart.html"
#define MID_FILE "groupListJunction.html"
#define END_FILE "listEnd.html"

//check every 1/FRAC_DOUBLE_CHECK URLS which were valid in the past
//make negative to double check none
#define FRAC_DOUBLE_CHECK (-1)

//#define PUNCTAUTE
unsigned int numLines(char* fileName);
char* deBuff(char* str);
#ifdef PUNCTUATE
void punctuate(char* str);
#endif
void removeWhiteSpaceEnd(char* str);

bool isPunctuated(char* s);


void appendLine(char* text, char* link, char* fileName);

void clearString(char* s);

//reads until we get to end or EOF
//returns the string excluding end
char* readTill(FILE* f, char end);

void writeTopicStart(char* topic, unsigned int num, FILE* f);
void writeTopicEnd(char* topic, unsigned int num, FILE* f);

bool checkURL(char* str, Alphabet validURLs);


char* concat(char* first, char* second);
void checkConcat(void);
void testIsPunctuated(void);

void writeGroups(DotPoint* dots, int numLines, char* fileName);
void writeList(DotPoint* dots, int numLines, char* fileName);

void writeTextOnly(DotPoint* dots, int numLines, char* fileName);

bool wget(char* str);

char* deHTML(char* str);

void testDeHTML(void);

void writeHTML(char* fileName, int numLines, DotPoint* dots);

void appendFile(char* from, char* to);

void writeNumLines(char* fileName, int numLines);

void popup(char* s1, char* s2);

//argv[0]=exe name
//argv[1]=abbott.txt
//argb[2]=output html
//argv[3]=output txt
//argv[4]=valid urls
int main(int argc, char* argv[]){

   assert(argc==6);
   assert(argv[1]!=NULL);
   assert(argv[2]!=NULL);
   assert(argv[3]!=NULL);
   assert(argv[4]!=NULL);
   assert(argv[5]!=NULL);
   char* textInFile=argv[1];
   char* outputHTML=argv[2];
   char* outputText=argv[3];
   char* savedURLs=argv[4];
   char* linesOut=argv[5];

   testDeHTML();
   testIsPunctuated();
   checkConcat();

   Alphabet validURLs = alphaInit(savedURLs,FALSE);
   assert(checkWord("http://www.google.com",validURLs));


   char c;
   unsigned int lines=numLines(textInFile);
   writeNumLines(linesOut, lines);
   //assert(lines==117);
   DotPoint* dots=malloc(sizeof(DotPoint)*lines);
   unsigned int i;
   for(i=0; i<lines; i++){
      dots[i]=newDot();
   }
   int currLine=0;
   int currLinkNum=0;
   FILE* f=fopen(argv[1], READ);
   if(f==NULL){
      printf("error - can't open input file: %s\n", textInFile);
      abort();
   }
   printf("starting to read\n");
   char* str;
   while(currLine<lines){

      #ifndef DEBUG
         if(currLine%PROG_DOTS==1){
            putchar('.');
         }
      #endif
      str=readTill(f,'{');
      if(str[0]=='\0'){
        printf("lines = %d, currLine = %d\n", lines, currLine);
        abort();
      }
      removeWhiteSpaceEnd(str);
      #ifdef PUNCTUATE
         punctuate(str);
      #endif

      if(!isPunctuated(str)){
      	printf("error - line %d:\"%s\" is not punctuated\n", currLine+1,str);
         alphaSave(validURLs, savedURLs);
      	abort();
      }
      assert(currLine<lines);
      assert(dots[currLine]!=NULL);
      #ifdef DEBUG
         printf("adding sentence from line %d:\n   \"%s\"\n",currLine+1,str);
      #endif
      addText(dots[currLine],str);


      c='{';//not # yet

      currLinkNum=0;

      while(currLinkNum<MAX_LINKS_PER_LINE && c!='\n' && c!=EOF && c!='#'){

         //read from the character after '{' until '}'
         str=readTill(f,'}');

         assert(currLine<lines);
         assert(dots[currLine]!=NULL);
         if(!checkURL(str, validURLs)){
            printf("error on line number %d, invalid URL, link %d:\n   '%s'\n",currLine+1,currLinkNum+1,str);
            printf("manual add? (y/n)\n");
            popup("dodgey URL","Manual add?");
            if(tolower(getchar())!='y'){
               alphaSave(validURLs, savedURLs);
               abort();
            }
            assert(getchar()=='\n');
         }
         #ifdef DEBUG
            printf("adding URL number %d from line %d:\n   \"%s\"\n",currLinkNum,currLine+1,str);
         #endif
         if(!checkWord(str, validURLs)){
            addWord(str, validURLs,TRUE);
         }
         addLink(dots[currLine],str);
   	   currLinkNum++;
         c=fgetc(f);
         if(c!='#' && c!='{'){

            printf("   text reads: \"%s\"\n",getText(dots[currLine]));
            printf("   link read: \"%s\"\n",str);
            printf("   c='%c'=%d\n",c,c);
            alphaSave(validURLs, savedURLs);
            if(c=='\n'){
               printf("error on line %d of input file %s\n!!!NO HASHTAG\n", currLine+1, textInFile);
            }else{
               printf("error on line %d of input file %s\n   link not ended\n", currLine+1, textInFile);
            }
            abort();
         }

   	}
   	if(currLinkNum>=MAX_LINKS_PER_LINE){
   	   printf("error - increase MAX_LINKS_PER_LINE=%d, because of line %d=\"%s\"\n", MAX_LINKS_PER_LINE, currLine+1,getText(dots[currLine]));
         alphaSave(validURLs, savedURLs);
   	   abort();
      }else if(c!='#'){
         printf("error on line %d of input file %s, doesn't end with '#', ends with '%c'\n",currLine+1,textInFile,c);
      }

      //read in the topic
      //we've just passed the '#'
      str=readTill(f,'\n');
      #ifdef DEBUG
            printf("adding topic %s from line %d:\n",str,currLine+1);
         #endif
      addTopic(dots[currLine],str);
      currLine++;
   }
   fclose(f);

   printf("\nfinished reading in inside file %s\n",argv[0]);

   #ifdef DEBUG
      printf("list after reading:\n");
      for(i=0; i<lines; i++){
         printDot(dots[i]);
      }
      printf("lines=%d\n",lines);
   #endif

   for(i=0; i<lines; i++){
      if(!checkDotComplete(dots[i])){
         printf("incomplete dot for line %d\n",i+1);
         printDot(dots[i]);
         alphaSave(validURLs, savedURLs);
         abort();
      }
   }

   writeHTML(outputHTML, lines, dots);

   writeTextOnly(dots, lines, outputText);
   alphaSave(validURLs, savedURLs);

   printf("finished everything in file %s\n",argv[0]);

   return EXIT_SUCCESS;
}

void writeHTML(char* fileName, int numLines, DotPoint* dots){
   #ifdef DEBUG
      printf("entering writeHTML on file %s\n",fileName);
   #endif
   remove(fileName);
   appendFile(START_FILE, fileName);
   writeGroups(dots, numLines, fileName);
   appendFile(MID_FILE, fileName);
   writeList(dots,numLines,fileName);
   appendFile(END_FILE, fileName);
}

void appendFile(char* from, char* to){
   assert(from!=NULL);
   assert(to!=NULL);
   char* temp1=concat(" >> ",to);
   char* temp2=concat(from,temp1);
   char* cmd=concat("cat ",temp2);
   #ifdef DEBUG
      printf("appending %s to %s\n",from, to);
   #endif
   int ret=system(cmd);
   assert(ret==0);
   free(cmd);
   free(temp1);
   free(temp2);
}

void writeGroups(DotPoint* dots, int numLines, char* fileName){
   assert(dots!=NULL);
   assert(fileName!=NULL);
   assert(numLines>0);
   printf("writing groups to file %s\n",fileName);

   char* str;
   FILE* f=fopen(fileName,APPEND);
   assert(f!=NULL);

   int i,j;
   for(i=0; i<numTopics(); i++){
      if(dots[0]==NULL){
         printf("error - dots[0]==NULL\n");
         abort();
      }
      str=NULL;
      for(j=0; str==NULL && j<numLines; j++){
         if(j+1<numLines){
            if(dots[j]==NULL){
               printf("error - dots[%d]=NULL\n",j);
               abort();
            }
         }
         if(getTopicNum(dots[j])==i){
            str=getTopic(dots[j]);
         }
      }
      if(j==numLines){
         printf("there is no dot with topic %d\n",i);
         #if 0
            abort();
         #endif
      }else{
         assert(str!=NULL);
         writeTopicStart(str,i,f);
#ifdef GROUP_REV_CHRONO
         for(j=0;j<numLines; j++){
#else
         for(j=numLines-1;j>=0; j--){
#endif
            if(getTopicNum(dots[j])==i){
               writeDot(dots[j],f);
            }
         }
         writeTopicEnd(str,i,f);
      }
   }


   fclose(f);
   printf("finished writing groups to file %s\n",fileName);
}


void writeList(DotPoint* dots, int numLines, char* fileName){
   assert(dots!=NULL);
   assert(fileName!=NULL);

   FILE* f=fopen(fileName, APPEND);

   int i;

   #ifdef DEBUG
      printf("printing the chronological list in '%s'\n",fileName);
   #endif

   #ifdef UNGROUPED_REV_CHRONO
   for(i=0; i<numLines; i++){
   #else
   for(i=numLines-1; i>=0; i--){
   #endif
      writeDot(dots[i],f);
   }


   fclose(f);
}

unsigned int numLines(char* fileName){
   unsigned int num=1;
   FILE* f=fopen(fileName, READ);
   if(f==NULL){
      printf("error - can't open file: %s\n", fileName);
      abort();
   }
   char c=fgetc(f);
   char temp;

   while(c!=EOF){
      if(c=='\n'){
         num++;
      }
      temp=fgetc(f);
      if((temp == EOF) && (c == '\n')){
        num--;
      }
      c = temp;
   }

   fclose(f);
   return num;
}

#ifdef PUNCTUATE
void punctuate(char* str){
   assert(str!=NULL);
   assert(*str!='\0');
   if(isPunctuated(str)){
   	return;
   }else if(str[1]=='\0'){
      *str='.';
   }else{
      punctuate(str+1);
   }
}
#endif


bool isPunctuated(char* s){
	assert(s!=NULL);
	assert(*s!='\0');
	//checking ? notation
	assert(1?1:0);
	assert(0?0:1);
   if(strcmp(s,".</b>")==0 || strcmp(s,".</b> ")==0){
      return TRUE;
	}else if (s[1]=='\0'){
	   return (s[0]=='.');
	}else if(s[2]=='\0'){
	   return (s[0]=='.' && s[1]==')') || isPunctuated(s+1);
	}else{
	   return isPunctuated(s+1);
	}
}

void removeWhiteSpaceEnd(char* str){
	assert(str!=NULL);
	assert(*str!='\0');
	if(str[0]==' ' && str[1]=='\0'){
		str[0]='\0';
	}else if(str[0]!='\0' && str[1]!='\0'){
		removeWhiteSpaceEnd(str+1);
	}
}

void clearString(char* s){
   assert(s!=NULL);
   if(*s!='\0'){
      *s='\0';
      clearString(s+1);
   }
}

//reads until we get to c
//returns the string excluding c
char* readTill(FILE* f, char end){
   assert(f!=NULL);
   char buff[BUFF_SIZE]={'\0'};
   int i=0;
   char c=fgetc(f);
   while(c!=end && i<BUFF_SIZE && c!=EOF){
      buff[i]=c;
      i++;
      c=fgetc(f);
   }

   if(i>=BUFF_SIZE){
      buff[i-1]='\0';
      printf("error - buffer not large enough when reading string:\n   %s\n",buff);
      abort();
   }else if(c==EOF){
      #ifdef DEBUG
         printf("read until EOF not until '%c'\n",c);
         printf("read in: \"%s\"\n",buff);
      #endif
   }
   char* new=malloc(i+1);
   int j;
   for(j=0; j<=i; j++){
      new[j]=buff[j];
   }
   if(0!=strcmp(new,buff)){
      printf("error reading till '%c'\n",c);
      printf("buff=\"%s\"\n",buff);
      printf("new=\"%s\"\n",new);
   }
   return new;
}

void writeTopicStart(char* topic, unsigned int num, FILE* f){
   assert(f!=NULL);
   assert(topic!=NULL);
   assert(num<numTopics());
   fprintf(f,"          <div id=\"right%d\" style=\"display:inline\">\n"
             "             <h3 onclick=\" expandcollapsetopic('%d');\" style=\"display:inline\">\n"
             "                   + %s\n"
             "             </h3>\n"
             "          </div>\n"
             "          <div id=\"down%d\" style=\"display:none\">\n"
             "             <h3 onclick=\" expandcollapsetopic('%d');\" style=\"display:inline\">\n"
             "                   %s; %s\n"
             "             </h3>\n"
             "          </div>\n"
             "       <div id=\"topic%d\" style=\"display:none\">\n"
             "             <ul id=l_group%d>\n",
             num,num,topic,num,num,"&#8210",topic,num,num);

}
void writeTopicEnd(char* topic, unsigned int num, FILE* f){
   assert(f!=NULL);
   assert(topic!=NULL);
   assert(num<numTopics());

   fprintf(f,"             </ul>\n"
             //"          </p>\n"
             "       </div>\n"
             "       <br/>\n");

}

bool checkURL(char* str, Alphabet validURLs){
   assert(str!=NULL);
   assert(validURLs!=NULL);
   if(!checkWord(str, validURLs) ||
      (FRAC_DOUBLE_CHECK>=0 &&
       rand()%(FRAC_DOUBLE_CHECK)==0)){
      int ret=wget(str);
      if(ret!=0){
         printf("***URL failure code: %d, str=%s\n",ret,str);
      }
      return ret==0;
   }else{
      return TRUE;
   }

}

bool wget(char* str){
   assert(strlen(str)>0);
   if(str[0]!='h' ||
      str[1]!='t' ||
      str[2]!='t' ||
      str[3]!='p'){
      printf("Invalid format for URL: \"%s\"\n",str);
      printf("Add 'http' to the start\n");
      printf("URL = %s\n", str);
      abort();
   }
   #ifdef DEBUG
      printf("about to run wget on '%s'\n",str);
   #else
      printf("Checking URL: %s\n",str);
   #endif
   char* cmd=concat(URL_CHECK_CMD, str);
   #ifdef DEBUG
      printf("running command:\n   '%s'\n",cmd);
   #endif
   int ret=system(cmd);
   int ret2=system("rm -f story-* > /dev/null");
   assert(ret2 || !ret2);//shut up gcc
   free(cmd);
   return ret;
}

char* concat(char* first, char* second){
   assert(first!=NULL);
   assert(second!=NULL);
   char* new=malloc(strlen(first)+strlen(second)+1);
   int i;
   for(i=0; i<strlen(first); i++){
      new[i]=first[i];
   }
   for(i=0; i<strlen(second)+1; i++){
      new[i+strlen(first)]=second[i];
   }
   return new;
}

void checkConcat(void){
   //printf("concat(\"abc\",\"de\")=\"%s\"\n",concat("abc","de"));
   assert(0==strcmp("abcde",concat("abc","de")));
}

void testIsPunctuated(void){
   assert(isPunctuated(".)"));
   assert(isPunctuated("."));
   assert(isPunctuated("asdasda."));
   assert(isPunctuated("a. sdasda."));
   assert(isPunctuated("a. sda.)sda."));
   assert(isPunctuated("a. sda)sda."));
   assert(!isPunctuated(".2"));
   assert(isPunctuated("."));
   assert(!isPunctuated("a)"));
   assert(!isPunctuated("a</b>"));
   assert(isPunctuated("a).</b>"));
}

void writeTextOnly(DotPoint* dots, int numLines, char* fileName){
   assert(dots!=NULL);
   assert(fileName!=NULL);
   char* temp;
   #ifdef DEBUG
      printf("writing text only to '%s'\n",fileName);
   #endif

   FILE* f=fopen(fileName, WRITE);
   assert(f!=NULL);

   int i;
   for(i=numLines-1; i>=0; i--){
      temp=deHTML(getText(dots[i]));
      fprintf(f, "%s\n", temp);
      free(temp);
   }

   fclose(f);

   #ifdef DEBUG
      printf("finished writing text only to '%s'\n",fileName);
   #endif
}

char* deHTML(char* str){
   assert(str!=NULL);

   int i;
   char* new=malloc(strlen(str)+1);
   for(i=0; i<strlen(str)+1; i++){
      new[i]='\0';
   }

   i=0;
   int j=0;
   while(str[i]!='\0'){
      if(str[i]=='<'){
         while(str[i]!='>'){
            assert(str[i]!='\0');//unclosed <>
            i++;
         }
         i++;
      }else{
         new[j]=str[i];
         j++;
         i++;
      }

   }
   return new;
}

void testDeHTML(void){
   #ifdef DEBUG
      printf("testing deHTML\n");
   #endif
   assert(0==strcmp(deHTML("abcde"),"abcde"));
   assert(0==strcmp(deHTML("abc<>de"),"abcde"));
   assert(0==strcmp(deHTML("abcd<asdasfsdaf>e"),"abcde"));
   assert(0==strcmp(deHTML("a</asda><asda>bcde"),"abcde"));
   assert(0==strcmp(deHTML("a<asda>bcde</asdsa>"),"abcde"));
   #ifdef DEBUG
      printf("finished testing deHTML\n");
   #endif
}

void writeNumLines(char* fileName, int numLines){
   assert(fileName!=NULL);


   remove(fileName);
   FILE* f=fopen(fileName,WRITE);
   assert(f!=NULL);

   assert(numLines>0);

   fprintf(f, "%d", numLines);

   fclose(f);
}

void popup(char* s1, char* s2){
   //notify-send "error" "$1"
   char* s3=concat("notify-send \"",s1);
   char* s4=concat(s3,"\" \"");
   char* s5=concat(s4,s2);
   char* s6=concat(s5,"\"");

   char* cmd=s6;

   #ifdef DEBUG
      printf("sending inotify: \"%s\"\n",cmd);
   #endif

   int ret=system(cmd);

   assert(ret==0);

   free(s3);
   free(s4);
   free(s5);
   free(s6);
}
