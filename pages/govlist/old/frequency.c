//days.c
//by Matthew Davis
//10/12/13
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>
#include <time.h>
#include "debug.h"

#define TRUE (1==1)
#define FALSE (0==1)

#define EPOCH_TO_ELECTION 15955
typedef int bool;

#define READ "r"

int numLines(char* file);

int main(int argc, char* argv[]){
   if(argc!=2){
      printf("not enough arguments. argc=%d, should = 2\n", argc);
      assert(argc==1);
   }
   if(argv[1]==NULL){
      printf("error - argv[1]==NULL\n");
      assert(argv[0]!=NULL);
   }
   int days=(int) (time(NULL)/(60.0*60*24)-EPOCH_TO_ELECTION);
   float frequency = ((float) numLines(argv[1])) / ( days * 5.0 / 7) ;
   printf("%1.1f", frequency);
   return EXIT_SUCCESS;
}

int numLines(char* file){
   FILE* f=fopen(file, READ);
   assert(f);

   char c=fgetc(f);
   int num=0;
   while(c!=EOF){
      assert('0'<=c && c<='9');
      num=(10*num+(c-'0'));
      c=fgetc(f);
   }

   fclose(f);
   return num;
}
