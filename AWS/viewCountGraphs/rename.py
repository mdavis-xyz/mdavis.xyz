import boto3

timedTableName = "site-views-prod-timedTable-1F3Q4VYFV6121"
untimedTableName = "site-views-prod-untimedTable-TL8VTKE19D1M"



def getAllData(site):
    response = client.scan(TableName=tableName)
    data = [unwrapType(i) for i in response['Items']]

    while 'LastEvaluatedKey' in response:
        response = client.scan(
            TableName=tableName,
            ExclusiveStartKey=response['LastEvaluatedKey']
        )
        data += response['Items']

    return(data)

def rename(old,new):
   print("Renaming %s to %s" % (old,new))
   data = getAllData()
   print("TODO")


rename('unicycling','unicycle')
print("done")
