import boto3

source_table = 'site-views-prod-timedTable-1F3Q4VYFV6121'
dest_table = 'site-views-sam-dev-TimedTable-1CP37KT0U0OTY'

client = boto3.client('dynamodb', region_name='ap-southeast-2')
paginator = client.get_paginator('scan')

response_iterator = paginator.paginate(
    TableName=source_table,
    Select='ALL_ATTRIBUTES',
    PaginationConfig={
        'PageSize': 25,
    }
)

for page in response_iterator:
    print(f"Writing {len(page.get('Items', []))} items")
    response = client.batch_write_item(
        RequestItems={
            dest_table: [
                {
                    'PutRequest': {
                        'Item': i
                    }
                } for i in page.get('Items', [])
            ]
        },
    )