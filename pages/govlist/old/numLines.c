//numLines.c
//by Matthew Davis
//17/05/14
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>


#define TRUE (1==1)
#define FALSE (0==1)


#define READ "r"

typedef int bool;

int main(int argc, char* argv[]){
   assert(argc==2);

   FILE* f = fopen(argv[1],READ);
   assert(f!=NULL);
   int numLines=0;

   char c=fgetc(f);
   char temp;

   while(c!=EOF){
      if(c=='\n'){
         numLines++;
      }
      temp=fgetc(f);
      if((temp == EOF) && (c == '\n')){
        numLines--;
      }
      c = temp;
   }

   printf("%d",numLines);

   fclose(f);

   return EXIT_SUCCESS;
}
