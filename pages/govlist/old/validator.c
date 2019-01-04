//validator.c
//by Matthew Davis
//03/03/14
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>
#include "debug.h"

#define TRUE (1==1)
#define FALSE (0==1)
#define READ "r"
#define STACK_SIZE 20
#define BUFFER_SIZE 30
typedef int bool;

void clearString(char* s);
bool isWhiteSpace(char c);
char* copyStr(char* s);

bool eqStr(char* s1, char* s2);

void printStack(char** stack, int ptr);

int main(int argc, char* argv[]){
   assert(eqStr("hello","hello"));
   assert(!eqStr("hello","hell"));
   assert(!eqStr("hello","helol"));
   char* stack[STACK_SIZE]={0};
   if(argc!=2){
      printf("error - not enough arguments. argc==%d, should ==2\n",argc);
      assert(argc==2);
   }
   if(argv[1]==NULL){
      printf("error - argv[1]==NULL\n");
      assert(argv[1]!=NULL);
   }
   FILE* f=fopen(argv[1],READ);
   assert(f!=NULL);
   int ptr=-1;
   int bufferIndex;
   char buffer[BUFFER_SIZE]={0};
   char c=fgetc(f);
   bool closing;
   bool oneBlock;
   while(c!=EOF){
      if(c=='<'){
         c=fgetc(f);
         assert(c!=EOF);
         if(c=='?'){
            while(c!=EOF && c!='>'){
               c=fgetc(f);
            }
            assert(c!=EOF);
         }else if(c!='!'){
            clearString(buffer);
            bufferIndex=0;
            if(c=='/'){
               closing=TRUE;
               c=fgetc(f);
               assert(c!=EOF);
            }else{
               closing=FALSE;
            }
            while(c!=EOF && c!='>' && !isWhiteSpace(c)){
               buffer[bufferIndex]=c;
               bufferIndex++;
               c=fgetc(f);
            }
            assert(c!=EOF);
            if(closing){
               #ifdef DEBUG
                  printf("found \"</%s...>\"\n",buffer);
               #endif
               if(ptr<=-1){
                  printf("unbalenced. Stack is empty yet I saw \"</%s...\"\n",buffer);
                  printStack(stack,ptr);
                  abort();
               }
               if(buffer[strlen(buffer)-1]=='/'){
                  #ifdef DEBUG
                     printf("one block: <%s/>\n",buffer);
                  #endif
               }else if(eqStr(stack[ptr],buffer)){
                  ptr--;
               }else{
                  printf("error - \"</%s...\" does not match \"</%s...\"\n",stack[ptr],buffer);
                  printStack(stack,ptr);
                  abort();
               }
               while(c!=EOF && c!='>'){
                  c=fgetc(f);
               }
               assert(c!=EOF);
            }else{
            
               oneBlock=FALSE;
               while(c!=EOF && c!='>'){
                  if(c=='/'){
                     c=fgetc(f);
                     assert(c!=EOF);
                     if(c=='>'){
                        oneBlock=TRUE;
                     }
                  }else{
                     c=fgetc(f);
                  }
               }
               oneBlock = oneBlock || buffer[strlen(buffer)-1]=='/';
               #ifdef DEBUG
                  printf("section A: oneBlock=%d, buffer=%s\n",oneBlock, buffer);
               #endif
               assert(c!=EOF);
               if(!oneBlock){
                  #ifdef DEBUG
                     printf("found \"<%s...>\"\n",buffer);
                  #endif
                  if(ptr==STACK_SIZE-1){
                    printf("error - stack size exceeded with \"<%s...\"\n", buffer);
                    abort();
                 }
                 ptr++;
                 stack[ptr]=copyStr(buffer);
               }else{
                  #ifdef DEBUG
                     printf("found \"<%s.../>\"\n",buffer);
                  #endif
               }
            }
         }else{
            while(c!=EOF && c!='>'){
               c=fgetc(f);
            }
            assert(c!=EOF);
         }
      }
      c=fgetc(f);
   }
   
   fclose(f);
   
   return EXIT_SUCCESS;
}

bool isWhiteSpace(char c){
   return (c==' ') || (c=='\t') || (c=='\n');
}

void clearString(char* s){
   assert(s!=NULL);
   if(*s!='\0'){
      *s='\0';
      clearString(s+1);
   }
}

bool eqStr(char* s1, char* s2){
   assert(s1!=NULL);
   assert(s2!=NULL);
   return (*s1=='\0' && *s2=='\0') || (*s1!='\0' && *s2!='\0' && *s1==*s2 && eqStr(s1+1,s2+1));
}

char* copyStr(char* s){
   assert(s!=NULL);
   char* new=malloc(strlen(s)+1);
   int i;
   for(i=0; i<=strlen(s)+1; i++){
      new[i]=s[i];
   }
   assert(eqStr(new,s));
   return new;
}

void printStack(char** stack, int ptr){
   assert(stack!=NULL);
   assert(ptr<STACK_SIZE);
   int i;
   if(ptr==-1){
      printf("EMPTY STACK\n");
   }else{
      printf("STACK:\n");
      for(i=ptr; i>=0; i--){
         if(stack[i]==NULL){
            printf("*****ERROR*****\n");
            printf("STACK[%d]=NULL\n",i);
         }else{
            printf("STACK[%d]=\"%s\"\n",i,stack[i]);
         }
      }
   }
   
   
}
