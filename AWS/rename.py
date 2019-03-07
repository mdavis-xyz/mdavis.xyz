import boto3
import pprint as pp

from copy import deepcopy as copy

client = boto3.client('dynamodb')

timedTableName = "site-views-prod-timedTable-1F3Q4VYFV6121"
untimedTableName = "site-views-prod-untimedTable-TL8VTKE19D1M"


def getAllData(site):
    expr = "site = :%s" % site
    response = client.query(
        TableName=timedTableName,
        ExpressionAttributeValues={
            ':v1': {
                'S': site
            },
        },
        KeyConditionExpression='site = :v1',
    )
    data = [i for i in response['Items']]

    while 'LastEvaluatedKey' in response:
        response = client.query(
            TableName=timedTableName,
            ExclusiveStartKey=response['LastEvaluatedKey'],
            ExpressionAttributeValues={
                ':v1': {
                    'S': site
                },
            },
            KeyConditionExpression='site = :v1',
        )
        data += response['Items']


    return(data)

def batchWrite(data):
    for item in data:
        print("Putting ")
        pp.pprint(item)
        response = client.update_item(
            TableName=timedTableName,
            Key={
                'time': {
                    'N': str(item['time']['N'])
                },
                'site': {
                    'S': item['site']['S']
                }
            },
            UpdateExpression='ADD siteViews :q',
            #ExpressionAttributeNames={
            #    'N': 'count'
            #},
            ExpressionAttributeValues={
                ':q': {
                    'N': str(item['siteViews']['N'])
                }
            }
        )

def rename(old,new):
   print("Renaming %s to %s" % (old,new))
   oldData = getAllData(old)

   newData = copy(oldData)

   for i in newData:
       assert(i['site']['S'] == old)
       i['site']['S'] = new

   batchWrite(newData)

   pp.pprint(data)


rename('unicycling','unicycle')
print("done")
