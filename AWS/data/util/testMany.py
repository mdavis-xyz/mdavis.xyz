import boto3
from multiprocessing import Pool
import json

def invoke(i):
    print("%d starting" % i)
    name = 'website-logs-dev-front-SS21MRC016X5'
    client = boto3.client('lambda')
    results = []
    for j in range(20):
        response = client.invoke(
            FunctionName=name,
            InvocationType='RequestResponse',
            Payload=json.dumps({'unitTest':True}).encode(),
            LogType='Tail'
        )
        print("%d.%d finished, returned %d" % (i,j,response['StatusCode']))
        results.append(response['StatusCode'])

    return(results)

with Pool(10) as p:
    print("starting")
    results = p.map(invoke, range(20))
    # flatten list of lists
    results = sum(results,[])
    print("multiproc finished")
    print("%d passed" % len([x == 200 for x in results]))
    assert(all([x == 200 for x in results]))

print("done")
