# BBP - Better Boto Paginator


[boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) is the official Python SDK for Amazon Web Services (AWS).
It has [pagination](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/paginators.html) functionality.
This means that if you're trying to enumerate a long list of resources, the paginator will provides an easier way to fetch chunk after chunk of the resource list, compared to raw `list_` calls.

The problem with how the module exposes these pages is that you end up with a list of lists.
For example, to get a list of all objects within an S3 bucket, you can do:

```
import boto3
client = boto3.client('s3')
paginator = client.get_paginator('list_objects_v2')
objects = [p['Contents'] for p in paginator.paginate(Bucket='my-bucket')]
```

This returns a list of lists of object information.
Do you remember off the top of your head how to flatten a list of lists into one list through list comprehension?
I sure don't.
Yes I could have a for loop and append to a list each iteration, but that feels like more effort than should be required.

Even if you're not loading the whole resource list into a list in memory, and are instead processing within a for loop, you end up with a messy nested for loop.

```
for page in paginator.paginate(Bucket='my-bucket'):
    if ['Contents'] in page:
        for element in page['Contents']:
             process(element)
```

I find this a bit awkward. 
What I really want is:

```
for element in function(Bucket='my-bucket'):
   process(element)
```

Where `function` is smart enough to either return the next item on the page it already has in memory,
or fetch the next page with a new API call and return the first item of that.

I wrote the [bbp](https://pypi.org/project/bbp/) library to solve this problem.
(The code is published on [GitHub](https://github.com/mdavis-xyz/bbp).)

## Installation

`pip install bbp`

## Usage

Here's an example of how to use it for the [Lambda `ListFunctions` paginator](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/lambda.html#Lambda.Paginator.ListFunctions).


```
from wrapper import paginator
from pprint import pprint
for lam in paginator('lambda', 'list_functions', 'Functions'):
    pprint(lam) # process just one element at a time
```

* `lambda` is what you would pass to `boto3.client()`
* `list_functions` is what you would pass to `client.get_paginator()`
* `Functions` is the key within the response to `list_objects_v2` which contains the list of resources for each page.
  This varies for each type of pagination call. You have to look up [the documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/lambda.html#Lambda.Paginator.ListFunctions).
  Eventually I'll try to get this tool to lookup or remember that.

Here's another example, using the [S3 `ListObjectsV2` paginator](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html#S3.Paginator.ListObjectsV2).
In this example we need to pass in the bucket name as an extra argument.
Just specify this as a `name=value` pair at the end of the argument list.

```
for obj in paginator('s3', 'list_objects_v2', 'Contents', Bucket='mybucket'):
    pprint(obj) # process a single resource
``` 

* `s3` is what you would pass to `boto3.client()`
* `list_objects_v2` is what you would pass to `client.get_paginator()`
* `Bucket='mybucket'` and any other `name=value` arguments are what get passed to [the paginator](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html#S3.Paginator.ListObjectsV2).
