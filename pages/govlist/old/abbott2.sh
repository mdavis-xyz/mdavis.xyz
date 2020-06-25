#!/bin/bash

ROOT_DIR="/home/matthew/Documents/abbott"
TEXT_FILE="/home/matthew/Documents/abbott/abbottShort.txt"
PUBLISH=0
TEMP="temp"
PUBLIC="public"
GIT_DIR="git/abbottList"
BEST="abbott.html"
TEXT_ONLY="abbottList.txt"
WORDS_FILE="words.txt"
VALID_URLS="validURLs.txt"
DROPBOX_ON=0
LIST_ONLY="pureContent.html"
LIST_AND_CODE="pureContentAndCode.html"
NUM_LINES="numLines.txt"
SCRIPT="script.html"
DAYS="days.txt"
TEMP_END="temp_end.html"
GIT_INPUT="gitInput.mld"

#FTP commands
FTP_HOST="ftp.deskie.com"
FTP_USER="matthew@deskie.com"
FTP_PASSWORD="mE0747A0I7tCayB"
FTP_FILE=$ROOT_DIR/$PUBLIC/"sauce.html"
FTP_INPUT=$ROOT_DIR/"ftp_input.txt"

abort(){
        echo "deliberate abort: '$1'"
        notify-send "error" "$1"
        exit -1
}

# dropboxFolderWait(){
#    dropbox filestatus $ROOT_DIR | grep -q up\ to\ date
#    BOOL=$?
#    while [ $BOOL -ne 0 ]
#    do
#    sleep 2
#    dropbox filestatus $ROOT_DIR | grep -q up\ to\ date
#    BOOL=$?
#    done
# }

# dropboxFileWait(){
#    dropbox filestatus $TEXT_FILE | grep -q up\ to\ date
#    BOOL=$?
#    while [ $BOOL -ne 0 ]
#    do
#    sleep 2
#    dropbox filestatus $TEXT_FILE | grep -q up\ to\ date
#    BOOL=$?
#    done
# }

# dropboxWait(){

#    if [ "$DROPBOX_ON" == 1 ];
#    then
#       echo "waiting for dropbox"
#       dropboxFileWait
#       dropboxFolderWait
#       echo "dropbox is ready"
#    else
#       echo "skipping waiting for dropbox"
#    fi


# }

compileAll(){
   echo "compiling"
   cd $ROOT_DIR
   make
   if [  $? != 0 ];
   then
      abort "compilation error"
   fi
   echo "done compiling"
}

spellcheck_func(){
   echo "running spellcheck_func"

   $ROOT_DIR/spellcheck $TEXT_FILE $ROOT_DIR/$WORDS_FILE
   if [  $? != 0 ];
   then
      abort "spellcheck"
   fi
   echo "spellcheck_func complete"
}

# old_func(){

#    echo "copy over old spellcheck.c, just add a new safe variable"
#    abort "deliberate abort"

#    cat $ROOT_DIR/abbottStart.xhtml > $ROOT_DIR/abbottTemp.xhtml
#    echo "<p class=\"main\">The Abbott government has been in power for" >> $ROOT_DIR/abbottTemp.xhtml
#    $ROOT_DIR/days >> $ROOT_DIR/abbottTemp.xhtml
#    echo " days. In that time they:</p>" >> $ROOT_DIR/abbottTemp.xhtml
#    echo "<ul class=\"itemize\">" >> $ROOT_DIR/abbottTemp.xhtml
#    echo "<li class=\"itemize_item\">" >> $ROOT_DIR/abbottTemp.xhtml
#    $ROOT_DIR/abbott $TEXT_FILE $ROOT_DIR/abbottC.txt
#    if [  $? != 0 ];
#    then
#       echo "old_func didn't convert properly";
#       abort "List is inconsistant"
#    fi
#    cat $ROOT_DIR/abbottC.txt >> $ROOT_DIR/abbottTemp.xhtml
#    cat $ROOT_DIR/abbottEnd.xhtml >> $ROOT_DIR/abbottTemp.xhtml
#    echo "on day" >> $ROOT_DIR/abbottTemp.xhtml
#    $ROOT_DIR/days >> $ROOT_DIR/abbottTemp.xhtml
#    echo " of the Abbott Government (" >> $ROOT_DIR/abbottTemp.xhtml
#    date '+%B %d %Y' >> $ROOT_DIR/abbottTemp.xhtml
#    echo ")<br></br>" >> $ROOT_DIR/abbottTemp.xhtml
#    echo "Total: " >> $ROOT_DIR/abbottTemp.xhtml
#    ./numLines "/home/matthew/Dropbox/abbott.txt" >> $ROOT_DIR/abbottTemp.xhtml
#    if [  $? != 0 ];
#    then
#       abort "num lines didn't work"
#    fi
#    echo " dot points" >> $ROOT_DIR/abbottTemp.xhtml
#    echo "<br></br>That's an average of " >> $ROOT_DIR/abbottTemp.xhtml
#    $ROOT_DIR/frequency $TEXT_FILE >> $ROOT_DIR/abbottTemp.xhtml
#    if [  $? != 0 ];
#    then
#       abort "Frequency calculation didn't work"
#    fi
#    echo " dot points per business day.<br></br>Return to my <a href=\"https://bit.ly/mattDavis\">homepage</a></p></body></html>" >> $ROOT_DIR/abbottTemp.xhtml

#    echo "doing Tharunka stuff"

#    ./tharunkaCompiler
#    if [  $? != 0 ];
#    then
#       abort "tharunka executible didn't run properly"
#    fi

#    rm temp.html -f
#    cat $ROOT_DIR/tharunka/tharunkaHTMLstart.html $ROOT_DIR/tharunka/html/partial/chronological/abbottList.html > temp.html
#    rm full.html -f
#    cat temp.html $ROOT_DIR/tharunka/tharunkaHTMLend.html > $ROOT_DIR/tharunka/html/full/chronological/abbottList.html


#    rm temp.html -f
#    cat $ROOT_DIR/tharunka/tharunkaHTMLstart.html $ROOT_DIR/tharunka/html/partial/reversed/abbottList.html > temp.html
#    rm full.html -f
#    cat temp.html $ROOT_DIR/tharunka/tharunkaHTMLend.html > $ROOT_DIR/tharunka/html/full/reversed/abbottList.html

# }

new_func(){
   $ROOT_DIR/abbott2 $TEXT_FILE $ROOT_DIR/$TEMP/$LIST_ONLY $ROOT_DIR/$TEMP/$TEXT_ONLY $ROOT_DIR/$VALID_URLS $ROOT_DIR/$NUM_LINES
   if [  $? != 0 ];
   then
      abort "abbott2.c failed"
   else
      echo "abbott2.c sucess"
   fi
   rm $ROOT_DIR/$TEMP/$BEST
   cp $ROOT_DIR/head.html $ROOT_DIR/$TEMP/$BEST
   cat $ROOT_DIR/title.html >> $ROOT_DIR/$TEMP/$BEST
   cat $ROOT_DIR/days.js >> $ROOT_DIR/$TEMP/$BEST
   # cat $ROOT_DIR/$DAYS >> $ROOT_DIR/$TEMP/$BEST
   cat $ROOT_DIR/preList.html >> $ROOT_DIR/$TEMP/$BEST
   cat $ROOT_DIR/$SCRIPT >> $ROOT_DIR/$TEMP/$BEST
   #for the sauce
   cp $ROOT_DIR/"titleSmall.html" $ROOT_DIR/$TEMP/$LIST_AND_CODE
   cat $ROOT_DIR/days.js >> $ROOT_DIR/$TEMP/$LIST_AND_CODE
   echo " days. This page contains a list of most of what they have done so far.</p>" >> $ROOT_DIR/$TEMP/$LIST_AND_CODE
   cat $ROOT_DIR/$SCRIPT >> $ROOT_DIR/$TEMP/$LIST_AND_CODE
   cat $ROOT_DIR/$TEMP/$LIST_ONLY >> $ROOT_DIR/$TEMP/$LIST_AND_CODE

   cat $ROOT_DIR/$TEMP/$LIST_ONLY >> $ROOT_DIR/$TEMP/$BEST
   echo "calculations now"


   echo "appending to " $ROOT_DIR/$TEMP_END
   echo "<p>" > $ROOT_DIR/$TEMP_END
   echo "That's a total of " >> $ROOT_DIR/$TEMP_END
   cat $ROOT_DIR/$NUM_LINES >> $ROOT_DIR/$TEMP_END
   echo " dot points in " >> $ROOT_DIR/$TEMP_END
   # cat $ROOT_DIR/$DAYS >> $ROOT_DIR/$TEMP_END
   cat $ROOT_DIR/days.js >> $ROOT_DIR/$TEMP_END
   echo " days. Averaging " >> $ROOT_DIR/$TEMP_END
   # ./frequency $ROOT_DIR/$NUM_LINES >> $ROOT_DIR/$TEMP_END
   cat $ROOT_DIR/frequencyStart.js >> $ROOT_DIR/$TEMP_END
   cat $ROOT_DIR/$DAYS >> $ROOT_DIR/$TEMP_END
   cat $ROOT_DIR/frequencyEnd.js >> $ROOT_DIR/$TEMP_END

   echo " dot points per business day." >> $ROOT_DIR/$TEMP_END
   echo "</p>" >> $ROOT_DIR/$TEMP_END

   cat $ROOT_DIR/$TEMP_END >> $ROOT_DIR/$TEMP/$LIST_AND_CODE
   cat $ROOT_DIR/$TEMP_END >> $ROOT_DIR/$TEMP/$BEST
   cat $ROOT_DIR/tail.html >> $ROOT_DIR/$TEMP/$BEST

}

validate_file(){
   echo "validating '$1'"
   $ROOT_DIR/validator $1
   if [  $? != 0 ];
   then
      abort "validation of file $1 failed"
   fi
}

validate_func(){
   echo "checking html"

   # validate_file $ROOT_DIR/abbottTemp.xhtml
   # validate_file $ROOT_DIR/tharunka/text/chronological/abbottList.txt
   # validate_file $ROOT_DIR/tharunka/text/reversed/abbottList.txt
   # validate_file $ROOT_DIR/tharunka/html/full/chronological/abbottList.html
   # validate_file $ROOT_DIR/tharunka/html/full/reversed/abbottList.html
   # validate_file $ROOT_DIR/tharunka/html/partial/chronological/abbottList.html
   # validate_file $ROOT_DIR/tharunka/html/partial/reversed/abbottList.html
   validate_file $ROOT_DIR/$TEMP/$BEST
}

publish_func(){
    # abort "redo publishing function"
    echo "publishing"
    # echo "publishing abbott.xhtml"
    # cp $ROOT_DIR/abbottTemp.xhtml $ROOT_DIR/abbott.xhtml
    # echo "done abbott.c part"

    # cd tharunka
    # cp -r * ../tharunkaPublic

   cp -r $ROOT_DIR/$TEMP/* $ROOT_DIR/$PUBLIC
   cp -r $ROOT_DIR/$TEMP/* $ROOT_DIR/$GIT_DIR

}

# my_ftp(){
#    echo "Doing FTP stuff"

#    echo "<html><body>" > $FTP_FILE
#    cat $ROOT_DIR/$PUBLIC/$LIST_AND_CODE >> $FTP_FILE
#    echo "</html></body>" >> $FTP_FILE

# #ftp $FTP_HOST < $FTP_INPUT
# ftp -n $FTP_HOST << END_SCRIPT
# quote USER $FTP_USER
# quote PASS $FTP_USER
# put $FTP_FILE
# quit
# END_SCRIPT

#    echo "Finished FTP stuff"
# }

git(){
   echo "updating git"
   cd $ROOT_DIR/$GIT_DIR
   pwd
   $ROOT_DIR/git.sh
   echo "updated git"
   # git commit -a -m "shell script update"
   # git push https://mdavis-xyz@github.com/mdavis-xyz/abbottList.git master
}

main(){

   clear
   cd $ROOT_DIR
   echo "starting abbottisation"

   # dropboxWait

   compileAll

   spellcheck_func

   new_func

   #old_func

   validate_func

   if [ "$PUBLISH" == 1 ]
   then
      publish_func
      git
      echo "done abbott.sh"
   else
      echo "not publishing because you don't want me to"
   fi

   #my_ftp

   #nemo $ROOT_DIR/$PUBLIC &


   notify-send "Achievement Unlocked" "Abbott list updated"
   echo "finished abbott.sh"
   # echo "password is  JqC59MF39hwQ7Yn"
   #subl $ROOT_DIR $ROOT_DIR/public/$LIST_AND_CODE


}
# cd $ROOT_DIR
# echo "running python"
# python3.4 $ROOT_DIR/abbott.py

echo "running old version"
#call main
main

#success
exit 1
