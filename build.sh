#!/bin/bash
set -e # exit if a line fails
ORIGINAL_DIR=$(pwd)
PAGES_DIR=$ORIGINAL_DIR/pages
PUBLISH_DIR=$ORIGINAL_DIR/docs

function supermarket {
   cd $PAGES_DIR/supermarket
   python convert.py
   mkdir -p $PUBLISH_DIR/supermarket
   cp -r $PAGES_DIR/supermarket/docs/. $PUBLISH_DIR/supermarket
}

function unicycle {
   cd $PAGES_DIR/unicycle
   python convert.py
   mkdir -p $PUBLISH_DIR/unicycle
   cp -r $PAGES_DIR/unicycle/docs/. $PUBLISH_DIR/unicycle
}

function paragraphiser {
   cd $PAGES_DIR/paragraphiser
   python convert.py
   mkdir -p $PUBLISH_DIR/paragraphiser
   cp -r $PAGES_DIR/paragraphiser/docs/. $PUBLISH_DIR/paragraphiser
}

function www {
   cd $PAGES_DIR/www
   python convert.py
   cp -r $PAGES_DIR/www/docs/. $PUBLISH_DIR/
}

function abbott {
   mkdir -p $PUBLISH_DIR/govlist
   cd $PAGES_DIR/abbott
   python parse.py
   cp -r $PAGES_DIR/abbott/docs/. $PUBLISH_DIR/govlist/
}

function monitor {
   mkdir -p $PUBLISH_DIR/thumbs/
   cp $PAGES_DIR/monitor/thumbs/monitor-rotate-sml-gray.jpg $PUBLISH_DIR/thumbs/
}

function blockchain {
   cd $PAGES_DIR/blockchain
   python parse.py
   mkdir -p $PUBLISH_DIR/blockchain
   cp -r $PAGES_DIR/blockchain/docs/. $PUBLISH_DIR/blockchain
}

function main {
   rm -rf $PUBLISH_DIR
   # cp -r docs_template docs
   mkdir $PUBLISH_DIR -p
   echo "www.mdavis.xyz" > $PUBLISH_DIR/CNAME
   www
   supermarket
   abbott
   monitor
   blockchain
   unicycle
   paragraphiser
}

main
