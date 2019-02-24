#!/usr/bin/env python
# coding: utf-8

# In[1]:


#get_ipython().run_line_magic('matplotlib', 'inline')


# In[2]:


import boto3
import pprint as pp
from copy import deepcopy as copy
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
import os


# In[3]:


timedTableName = "site-views-prod-timedTable-1F3Q4VYFV6121"
untimedTableName = "site-views-prod-untimedTable-TL8VTKE19D1M"

fileName = 'viewData.csv'

# In[4]:


client = boto3.client('dynamodb')


# In[5]:


# boto returns items like
# {'attributeName':{'S':'someString'}}
# change to just
# {'attributeName':'someString'}
def unwrapType(item):
    item = copy(item)
    convert = {
        'S':lambda x:x,
        'N':lambda x:int(x) if '.' not in x else float(x),
        'BOOL':lambda x:x
    }
    for attribute in item:
        try:
            dataType = list(item[attribute].keys())[0]
        except AttributeError as e:
            pp.pprint(item)
            print("Failed on attribute %s" % attribute)
            raise(e)
        assert(dataType in convert)
        item[attribute] = convert[dataType](item[attribute][dataType])
    return(item)

def testUnwrapType():
    print("testing")
    item = {
        'myInt':{
            'N':'123'
        },
        'myFloat':{
            'N':'12.3'
        },
        'myString':{
            'S':'someString'
        },
        'myBool':{
            'BOOL':False
        }
    }
    expected = {
        'myInt':123,
        'myFloat':12.3,
        'myString':'someString',
        'myBool':False
    }

    actual = unwrapType(item)
    if actual != expected:
        print("actual:")
        pp.pprint(actual)
        print("expected:")
        pp.pprint(expected)
    assert(actual == expected)
    print("Test passed")


# In[6]:


def getAllData(tableName):
    response = client.scan(TableName=tableName)
    data = [unwrapType(i) for i in response['Items']]

    while 'LastEvaluatedKey' in response:
        response = client.scan(
            TableName=tableName,
            ExclusiveStartKey=response['LastEvaluatedKey']
        )
        data += [unwrapType(i) for i in response['Items']]

    return(data)

def getTimedData():
    if not os.path.isfile(fileName):
        print("Fetching Data from Amazon")
        timedData = getAllData(timedTableName)
        df = pd.DataFrame(timedData)
        df.to_csv(fileName)
    else:
        print("Getting data from cache")
    data = pd.read_csv(fileName)
    return(data)

def main():

    df = getTimedData()

    df = df.rename(columns={'time':'unixTime'})
    df['time'] = pd.to_datetime(df['unixTime'], unit='s')
    #df = df.groupby('site',1)
    #print(df.columns)
    #df = df.sort_values(by=['time','site'],axis='columns',ascending=True)

    df.sort_values(by=['time','site'],inplace=True)
    df['totalCum'] = df['siteViews'].cumsum()


    plotTotal(df)
    for log in [True,False]:
        perSite(df,log=log)

def plotTotal(df):

    # df.set_index('time')
    print("Printing uncumulative view count, all sites")
    df.plot(x='time',y=['totalCum'],kind='line')
    plt.savefig('total.png')

    df.plot(x='time',y=['totalCum'],kind='line',figsize=(20,10))
    plt.savefig('total.png')

def perSite(df,log=True):

    sites = list(set(df['site']))
    print("Sites: %s" % sites)

    lastDate = max(df['time'])

    print("plotting per site")
    # plt.reset()
    totals = {}
    for site in sites:
        print("plotting for %s" % site)
        df_s = df[df['site'] == site]

        # extend out to today
        newItem = {
            'site': site,
            'time':lastDate,
            'siteViews':0
        }
        df_new = pd.DataFrame([newItem])
        df_s = df_s.append(df_new)


        df_s['siteCum'] = df_s['siteViews'].cumsum()
        plt.plot(df_s['time'],df_s['siteCum'])
        totals[site] = max(df_s['siteCum'])

    pp.pprint(totals)

    plt.legend(sites)
    if log:
        plt.yscale('log')
        plt.savefig('per-site-log.png')
        print("done plotting per site with log")
    else:
        plt.yscale('linear')
        plt.savefig('per-site.png')
        print("done plotting per site without log")


def tests():
    testUnwrapType()

tests()
main()
print("done")
