#CC=gcc
CFLAGS=-Werror -Wall -O

#.PHONEY:all
all: abbott2 spellcheck days frequency validator

abbott2: dotPoint.o abbott2.o alphabet.o
	$(CC) $(CFLAGS) dotPoint.c abbott2.c alphabet.c -o $@

spellcheck: spellcheck.o alphabet.o
	$(CC) $(CFLAGS) spellcheck.c alphabet.c -o $@

days: days.o
	$(CC) $(CFLAGS) days.c -o $@
        
frequency: frequency.o
	$(CC) $(CFLAGS) frequency.c -o $@
                
validator: validator.o
	$(CC) $(CFLAGS) validator.c -o $@

