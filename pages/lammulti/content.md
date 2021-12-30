If you deploy Python code to an [AWS Lambda function](https://aws.amazon.com/lambda/),
the multiprocessing functions in the standard library such as [`multiprocessing.Pool.map`](https://docs.python.org/3/library/multiprocessing.html?highlight=multiprocessing%20python%20map%20pool#multiprocessing.pool.Pool.map) will not work.

For example:

```
from multiprocessing import Pool
def func(x):
    return x*x
args = [1,2,3]
with Pool() as p:
    result = p.map(func, args)
```

will give you:

```
OSError: [Errno 38] Function not implemented
```

This is because AWS Lambda functions are very bare bones,
and have no shared memory device (`/dev/shm`).

There is a workaround using `Pipe`s and `Process`es.
Amazon documented it [in this blog post](https://aws.amazon.com/blogs/compute/parallel-processing-in-python-with-aws-lambda/).
However that example is very much tied to the work being done,
it doesn't have great error handling,
and is not structured in the way you'd expect when using the normal `multiprocessing` library.

I have written the `lambda_multiprocessing` library as a drop-in replacement for `multiprocessing.Pool`
which works in AWS Lambda functions using this workaround.

It is unit tested, handlers errors properly, and matches the interface of `multiprocessing.Pool`.

To install it, run `pip install lambda_multiprocessing`.
Then you can use it just like the normal `Pool`, for example:

```
from lambda_multiprocessing import Pool
def func(x):
    return x*x
args = [1,2,3]
with Pool() as p:
    result = p.map(func, args)
```

If you use [`moto`](https://docs.getmoto.org/en/latest/) to unit test your code,
you cannot do multiprocessing, because `moto` is not concurrency safe.
As a workaround, pass `0` as the argument to `Pool` when unit testing,
and a `None` or positive integer when really deployed.
This way when unit testing you'll get the interface of `Pool`,
but everything will actually run in the main thread, to keep `moto` happy.

To read more, visit the GitHub repository:

<div class="center" id="download-wrap">
   <a href="https://github.com/mdavis-xyz/lambda_multiprocessing" class="button" >Visit GitHub Repo</a>
</div>
