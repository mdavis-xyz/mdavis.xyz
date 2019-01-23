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

# do this outside a function, so it caches it
html_fname = 'response.html'
with open(html_fname,'r') as f:
    html = f.read()
    assert(type(html) == type(''))

def unit_tests():
    testPower10()

def lambda_handler(event,context):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    if ('unitTest' in event) and event['unitTest']:
        logger.info('Running unit tests')
        unit_tests()
        if 'queryStringParameters' in event:
            event['queryStringParameters']['websiteName'] = 'test'
        else:
            event['queryStringParameters'] = {'websiteName': 'test'}
        main(logger,event)
        return()
    else:
        logger.info('Running main (non-test) handler')
        return(main(logger,event))


def main(logger,event):
    logger.setLevel(logging.INFO)
    #logger.info("----")
    logger.info("logger view count Event:" + str(event).replace('\n',' '))
    #logger.info("servejson Content:" + str(context).replace('\n',' '))
    #uid = event['requestId']

    try:
        timestamp = int(event['requestTimeEpoch'])
    except KeyError as e:
        timestamp = int(time.time())
        logger.warn("could't find requestTimeEpoch. Using %d instead" % timestamp)

    logger.info("Keys to event: %s" % str([x for x in event]))
    for x in ['pathParameters','queryStringParameters']:
        try:
           logger.info("Keys to event['%s']: %s" % (x,str([x for x in event[x]])))
        except:
           logger.info("Can't find " + x)
    try:
        websiteName =  event['queryStringParameters']['websiteName']
    except (KeyError,TypeError):    
        logger.error("Can't find websiteName")
        response = {
          'statusCode': 400  ,
          'headers' : {
             "Access-Control-Allow-Origin": "*",
             "Content-Type": "text/html"
          },
          'body': "Error, websiteName parameter missing"
        }
        return(response)

#    if websiteName.lower() not in os.environ['allowedSites'].split(','):
#        logger.error("Website %s is not in allowed list (%s)" % os.environ['allowedSites'].split(','))
#        response = {
#            'statusCode': 400  ,
#            'headers' : {
#             "Access-Control-Allow-Origin": "*",
#             "Access-Control-Allow-Methods": "POST, GET",
#             "Access-Control-Allow-Headers": "X-PINGOTHER, Content-Type",
#             "Access-Control-Max-Age": 86400,
#             "Content-Type": "text/html"
#          },
#          'body': "Error, websiteName is not in the approved list"
#        }
#        return(response)
 

    #uid = event["requestContext"]["requestId"]
    updateTables(logger,websiteName,timestamp)

    response = {
      'statusCode': 200,
      'headers' : {
         "Content-Type": "text/html",
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Methods": "POST, GET",
         "Access-Control-Allow-Headers": "X-PINGOTHER, Content-Type",
         "Access-Control-Max-Age": 86400
      },
      'body': html
    }
    logger.info("Returning status 200")
    return(response)

def updateTables(logger,websiteName,timestamp):
    updateUntimed(logger,websiteName)
    updateTimed(logger,websiteName,timestamp)

def updateUntimed(logger,websiteName):
    logger.info("Incrementing total count for %s" % websiteName)
    client = boto3.client('dynamodb')
    tableName = os.environ['untimedTable'] 
    hashConst = os.environ['hashConst']

    response = client.update_item(
        TableName=tableName,
        Key={
            'hash': {
                'N': str(hashConst)
            },
            'site': {
                'S': websiteName
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
            notify(logger,websiteName,views)
        else:
            logger.info("Views are not a power of 10")
    except Exception as e:
        logger.info("Failed to check for powers of 10")
        logger.info(tb.format_exc())


def updateTimed(logger,websiteName,timestamp):
    logger.info("Incrementing total count for %s at %d" % (websiteName,timestamp))
    client = boto3.client('dynamodb')
    tableName = os.environ['timedTable'] 

    response = client.update_item(
        TableName=tableName,
        Key={
            'site': {
                'S': websiteName
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
        
def notify(logger,websiteName,views):

    client = boto3.client('sns')

    topic = os.environ['view_notif_topic']

    print('Sending SNS message to %s' % topic)

    msg = "The web page %s has just hit %d views!" % (websiteName,views)
    subject = "Web view count record"

    response = client.publish(
        TopicArn=topic,
        Message=msg,
        Subject=subject
    )

    print('sns message sent')

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

