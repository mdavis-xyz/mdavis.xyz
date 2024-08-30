import logging
import boto3
import botocore
from boto3.dynamodb.conditions import Key, Attr
import decimal
import datetime as dt
import pprint as pp
import json
import time
import os
from random import randint
import traceback as tb

from mangum import Mangum
from fastapi import FastAPI
from fastapi.responses import FileResponse


logger = logging.getLogger()
logger.setLevel(logging.INFO)

# cache outside functions
# for re-use between invocations
ddb_client = boto3.client('dynamodb')

app = FastAPI()

wsgi = Mangum(app)
def lambda_handler(event, context=""):
    logger.info(json.dumps(event))
    return wsgi(event=event, context=context)


@app.get("/increment")
def serve_increment(page_name: str='www'):
    logger.info(f"Received call for {page_name=}")
    timestamp = time.time()

    updateUntimed(page_name)
    updateTimed(page_name, timestamp)

    return FileResponse(path='response.html')

def updateUntimed(page_name):
    logger.info("Incrementing total count for %s" % page_name)
    hashConst = os.environ['HASH_CONST']

    response = ddb_client.update_item(
        TableName=os.environ['UNTIMED_TABLE_NAME'],
        Key={
            'hash': {
                'N': str(hashConst)
            },
            'site': {
                'S': page_name
            }
        },
        UpdateExpression='ADD siteViews :q',
        #ExpressionAttributeNames={
        #    'N': 'count'
        #},
        ExpressionAttributeValues={
            ':q': {
                'N': '1'
            }
        },
        ReturnValues='ALL_NEW'
    )
    logger.info('untimed database incremented') 
    try:
        logger.info("Checking for powers of 10")
        views = int(response['Attributes']['siteViews']['N'])
        logger.info("View were incremented to %s" % views)
        if power10(views):
            logger.info("Views are a power of 10")
            notify(page_name,views)
        else:
            logger.info("Views are not a power of 10")
    except Exception as e:
        logger.info("Failed to check for powers of 10")
        logger.info(tb.format_exc())


def updateTimed(page_name,timestamp):
    logger.info("Incrementing total count for %s at %d" % (page_name,timestamp))

    response = ddb_client.update_item(
        TableName=os.environ['TIMED_TABLE_NAME'],
        Key={
            'site': {
                'S': page_name
            },
            'time': {
                'N': str(int(timestamp)) # boto requires str for ints
            }
        },
        UpdateExpression='ADD siteViews :q',
        #ExpressionAttributeNames={
        #    'N': 'count'
        #},
        ExpressionAttributeValues={
            ':q': {
                'N': '1'
            }
        }
    )
    logger.info('timed database incremented') 
        
def notify(page_name,views):

    topic = os.environ['SNS_TOPIC_ARN']

    logger.info('Sending SNS message to %s' % topic)

    stage = os.environ['STAGE']
    msg = f"The web page {page_name} has just hit {views} views in {stage}!"
    subject = f"Web view count record ({stage})"

    response = boto3.client('sns').publish(
        TopicArn=topic,
        Message=msg,
        Subject=subject
    )

    logger.info('sns message sent')

# returns true if x is a power of 10
def power10(x):
    x = int(x)
    s = str(x)
    # yes I could write this as one boolean statement
    # but this is clearer
    if x < 1:
        return(False)
    elif x == 1:
        return(True)
    else:
        # equivilent to regex r"10+"
        return((s.startswith('1')) and (int(s[1:]) == 0))

    return(ret)

def testPower10():
    for x in range(10):
        assert(power10(10**x))
        assert(power10(float(10**x)))
        assert(not power10(10**x - 1))

