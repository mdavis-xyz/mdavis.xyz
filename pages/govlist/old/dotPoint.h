//dotPoint.h


#ifndef DOTPOINT_H
#define DOTPOINT_H

#define MAX_LINKS_PER_LINE 6
typedef struct dotPoint* DotPoint;


DotPoint newDot(void);

//str must be already malloced. Can't be written over
void addText(DotPoint D, char* str);

//str must be already malloced. Can't be written over
void addLink(DotPoint D, char* str);

//str will be touched, won't be freed.
//topic can be vague, we'll sort it out
void addTopic(DotPoint D, char* topic);
unsigned int getTopicNum(DotPoint D);
char* getTopic(DotPoint D);
unsigned int numTopics(void);


void deleteDot(DotPoint D);
void printDot(DotPoint D);

void printTextOnly(DotPoint D, FILE* f);
char* getText(DotPoint D);
void writeDot(DotPoint D, FILE* f);

bool checkDotComplete(DotPoint D);



#endif

