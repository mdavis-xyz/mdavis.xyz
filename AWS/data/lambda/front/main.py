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
    print('No unit tests to run')

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

    if websiteName.lower() not in os.environ['allowedSites'].split(','):
        logger.error("Website %s is not in allowed list (%s)" % os.environ['allowedSites'].split(','))
        response = {
            'statusCode': 400  ,
            'headers' : {
             "Access-Control-Allow-Origin": "*",
             "Access-Control-Allow-Methods": "POST, GET",
             "Access-Control-Allow-Headers": "X-PINGOTHER, Content-Type",
             "Access-Control-Max-Age": 86400,
             "Content-Type": "text/html"
          },
          'body': "Error, websiteName is not in the approved list"
        }
        return(response)
 

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
        }
    )
    logger.info('untimed database incremented') 


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
        
