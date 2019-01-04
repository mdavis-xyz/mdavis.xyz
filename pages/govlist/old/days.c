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

int main(int argc, char* argv[]){
   
   printf("%d", (int)  (time(NULL)/(60.0*60*24)-EPOCH_TO_ELECTION));
   return EXIT_SUCCESS;
}
