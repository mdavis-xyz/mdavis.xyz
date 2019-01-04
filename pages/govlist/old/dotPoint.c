//dotPoint.c
//by Matthew Davis
//23/03/14
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>
#include <ctype.h>
#include "bool.h"
#include "dotPoint.h"

#include "debug.h"


typedef struct dotPoint{
	char* text;
	char** links;
   char* topic;
   int topicPriority;
}dotPoint;

#define NUM_TOPICS 13

int getNumLinks(DotPoint D);
bool streq(char* a, char* b);
void unCapitalise(char* s);




DotPoint newDot(void){
	DotPoint new=malloc(sizeof(DotPoint));
	new->text=NULL;
	new->links=malloc(sizeof(char*)*MAX_LINKS_PER_LINE);
	int i;
	for(i=0; i<MAX_LINKS_PER_LINE; i++){
		(new->links)[i]=NULL;
	}
   new->topic=NULL;
   new->topicPriority=(-1);
	return new;
}

void printDot(DotPoint D){
	printf("Dot Point:\n");
	int i;
	if(D==NULL){
		printf("  Null DotPoint\n");
	}else{
		printf("   text = %s\n", D->text);
		assert(D->links!=NULL);
		for(i=0; i<MAX_LINKS_PER_LINE; i++){
			if((D->links)[i]==NULL){
				printf("   link[%d]=NULL\n", i);
			}else{
				printf("   link[%d]=\"%s\"\n", i, (D->links)[i]);
			}
		}
      printf("   topic = \"%s\"=%d\n",D->topic,getTopicNum(D));
	}
}
void addText(DotPoint D, char* str){
   assert(D!=NULL);
   assert(D->text==NULL);
   (D->text)=str;

}
void addLink(DotPoint D, char* str){

   assert(D!=NULL);
   assert(D->links!=NULL);
   #ifdef DEBUG
      printf("adding link: \"%s\"\n",str);
   #endif
   int numLinks=getNumLinks(D);
   assert(numLinks<MAX_LINKS_PER_LINE);
   (D->links)[numLinks]=str;
   assert(getNumLinks(D)==numLinks+1);
}

void deleteDot(DotPoint D){
	assert(D!=NULL);
	assert(D->links!=NULL);
	if(D->text!=NULL){
		free(D->text);
	}
	int i;
	for(i=0; i<MAX_LINKS_PER_LINE; i++){
	   if((D->links)[i]!=NULL){
	      free((D->links)[i]);
	   }
	}
	free(D->links);
}

int getNumLinks(DotPoint D){
   assert(D!=NULL);
   assert(D->links!=NULL);
   int i;

   for(i=0; i<MAX_LINKS_PER_LINE && (D->links)[i]!=NULL; i++);
   int numLinks=i;
   for(;i<MAX_LINKS_PER_LINE; i++){
      assert((D->links)[i]==NULL);
   }
   return numLinks;
}

void printTextOnly(DotPoint D, FILE* f){
   assert(f!=NULL);
   assert(D!=NULL);
   assert(D->text!=NULL);
   fputs(D->text,f);
}

void writeDot(DotPoint D, FILE* f){
   assert(f!=NULL);
   assert(D!=NULL);
   assert(D->text!=NULL);
   assert(D->links!=NULL);
   int i;

   fprintf(f,"               <li>\n");
   fprintf(f,"                  %s\n",D->text);
   for(i=0; i<getNumLinks(D); i++){
      #ifdef DEBUG
         printDot(D);
      #endif
      fprintf(f,"                     "
                "<a href=\"%s\">\n"
                "                       "
                "<img src=\""
                "http://thesauce.co/matthew/link_icon.png\""
                " alt=\"source\" height=\"15\" width=\"15\" /></a>\n"
                ,D->links[i]);
   }
   fprintf(f,"\n               </li>\n");
}

char* getText(DotPoint D){
   assert(D!=NULL);
   assert(D->text!=NULL);
   return D->text;
}

void addTopic(DotPoint D, char* topic){
   assert(topic!=NULL);
   assert(D!=NULL);
   assert(D->topic==NULL);
   unCapitalise(topic);
   if(streq(topic,"economy") ||
            streq(topic,"economics") ||
            streq(topic,"money") ||
				streq(topic,"tax") ||
            streq(topic,"economy") ||
            streq(topic,"budget") ||
			streq(topic,"housing") ||
            streq(topic,"costofliving") ||
            streq(topic,"cost of living") ||
            streq(topic,"finance")){
      D->topic="The Economy and the Cost of Living";
      D->topicPriority=0;
   }else if(streq(topic,"asylum") ||
      streq(topic,"immigration") ||
      streq(topic,"boats") ||
      streq(topic,"refugee")){
      D->topic="Humanitarian Immigration and the Military";
      D->topicPriority=1;
   }else if(streq(topic,"environment") ||
            streq(topic,"theenvironment") ||
            streq(topic,"green") ||
            streq(topic,"climatechange") ||
            streq(topic,"climate") ||
            streq(topic,"research") ||
            streq(topic,"technology") ||
            streq(topic,"science") ||
            streq(topic,"solar") ||
			streq(topic,"wind") ||
            streq(topic,"renewables") ||
            streq(topic,"carbon") ||
            streq(topic,"innovation")){
      D->topic="Science, Technology and the Environment";
      D->topicPriority=2;
   }else if(streq(topic,"education") ||
            streq(topic,"uni") ||
            streq(topic,"university") ||
            streq(topic,"school") ||
            streq(topic,"schools") ||
            streq(topic,"gonski") ||
            streq(topic,"tafe") ||
            streq(topic,"hecs") ||
            streq(topic,"tertiary")){
      D->topic="Education";
      D->topicPriority=3;
   }else if(streq(topic,"welfare") ||
            streq(topic,"equity") ||
            streq(topic,"homelessness") ||
            streq(topic,"pension") ||
            streq(topic,"newstart")){
      D->topic="Welfare and Equity";
      D->topicPriority=4;
   }else if(streq(topic,"indigenous") ||
            streq(topic,"multiculturalism") ||
            streq(topic,"aboriginal")){
      D->topic="Indigenous Affairs and Multiculturalism";
      D->topicPriority=5;
   }else if(streq(topic,"civil") ||
            streq(topic,"rights") ||
            streq(topic,"gay") ||
            streq(topic,"lgbt") ||
            streq(topic,"lgbti") ||
            streq(topic,"freedom") ||
            streq(topic,"ethics") ||
			streq(topic,"privacy") ||
            streq(topic,"metadata") ||
            streq(topic,"values") ||
            streq(topic,"terrorism") ||
            streq(topic,"gambling") ||
            streq(topic,"religion") ||
            streq(topic,"internetfilter") ||
            streq(topic,"queer")){
      D->topic="Civil Rights and Ethics";
      D->topicPriority=6;
   }else if(streq(topic,"army") ||
            streq(topic,"defence") ||
            streq(topic,"defense") ||
            streq(topic,"terror") ||
            streq(topic,"asio") ||
            streq(topic,"navy") ||
            streq(topic,"war") ||
				streq(topic,"guns") ||
            streq(topic,"security") ||
            streq(topic,"military")){
      D->topic="Military and Security Matters";
      D->topicPriority=7;
   }else if(streq(topic,"unions") ||
            streq(topic,"employment") ||
            streq(topic,"unemployment") ||
            streq(topic,"apprentice") ||
            streq(topic,"apprentices") ||
            streq(topic,"jobs") ||
            streq(topic,"wages") ||
            streq(topic,"workplace")){
      D->topic="Workplace Relations and Unemployment";
      D->topicPriority=8;
   }else if(streq(topic,"international") ||
            streq(topic,"aid") ||
            streq(topic,"diplomacy")){
      D->topicPriority=9;
      D->topic="International Relations and Diplomacy";
   }else if(streq(topic,"infrastructure") ||
            streq(topic,"nbn")){
      D->topic="Infrastructure";
      D->topicPriority=10;
   }else if(streq(topic,"health") ||
            streq(topic,"hospital") ||
            streq(topic,"hospitals") ||
            streq(topic,"mental") ||
            streq(topic,"ndis") ||
            streq(topic,"disability") ||
			streq(topic,"drugs") ||
            streq(topic,"age") ||
            streq(topic,"aging")){
      D->topic="Health";
      D->topicPriority=11;
   }else if(streq(topic,"abc") ||
            streq(topic,"sbs") ||
            streq(topic,"smh") ||
            streq(topic,"news") ||
            streq(topic,"corruption") ||
            streq(topic,"transparency") ||
            streq(topic,"democracy") ||
            streq(topic,"media")){
      D->topic="Media, Corruption and Transparency";
      D->topicPriority=12;
   }else{
      printf("ERROR: Unknown topic in dotPoint.c: \"%s\"\n",topic);
      printf("edit dotPoint.c\n");
      printf("check number or topics=%d\n",NUM_TOPICS);
      int ret = system("subl ~/Documents/abbott/dotPoint.c &");
      abort();
      (void) ret;//shut up gcc
   }
   assert(0<=D->topicPriority && D->topicPriority<NUM_TOPICS);
}

bool streq(char* a, char* b){
   return (0==strcmp(a,b));
}

void unCapitalise(char* s){
   *s=tolower(*s);
   if(*s!='\0'){
      unCapitalise(s+1);
   }
}
unsigned int getTopicNum(DotPoint D){
   assert(D!=NULL);
   assert(D->topic!=NULL);
   unsigned int num=D->topicPriority;

   assert(num<NUM_TOPICS);
   return num;
}

unsigned int numTopics(void){
   return NUM_TOPICS;
}

char* getTopic(DotPoint D){
   assert(D!=NULL);
   return D->topic;
}

bool checkDotComplete(DotPoint D){
   if(D==NULL){
      printf("D is NULL\n");
      return FALSE;
   }else if(D->text==NULL){
      printf("D->text==NULL\n");
      return FALSE;
   }else if(D->links[0]==NULL){
      printf("D->links[0]==NULL\n");
      return FALSE;
   }else if(D->topic==NULL){
      printf("D->topic==NULL\n");
      return FALSE;
   }else{
      return TRUE;
   }
}
