## Kinds of Errors

Very broadly speaking errors can be divided into two main groups:

1. Operational errors
2. Developer errors

Operational Errors are errors that happen while a program is undertaking a task. For instance, network failure would be an operational error. Operational errors should ideally be recovered from by applying a strategy that is appropriate to the scenario. For instance, in the case of a network error, a strategy would likely be to retry the network operation.

Developer Error is where a developer has made a mistake. The main example of this is invalid input. In these cases the program should not attempt to continue running and should instead crash with a helpful description so that the developer can address their mistake.

## Throwing

Typically, an input error is dealt with by using the `throw` keyword:

```sh
function doTask (amount) {
  if (typeof amount !== 'number') throw new Error('amount must be a number')
  return amount / 2
}
```

If `doTask` is called with a non-number, for instance `doTask('here is some invalid input')` the program will crash.

When the program crashes, a stack trace is printed. This stack trace comes from the error object we created straight after using the `throw` keyword. The Error constructor is native to JavaScript, and takes a string as the `Error` message, while auto generating a stack trace when created.

While it's recommended to always `throw` object instantiated from `Error` (or instantiated from a constructor that inherits from Error), it is possible to `throw` any value:

```sh
function doTask (amount) {
  if (typeof amount !== 'number') throw new Error('amount must be a number')
  // THE FOLLOWING IS NOT RECOMMENDED:
  if (amount <= 0) throw 'amount must be greater than zero'
  return amount / 2
}

doTask(-1)
```

By passing `-1` to `doTask` here, it will trigger a throw of a string, instead of an error

In this case there is no stack trace because an `Error` object was not thrown. As noted in the output the `--trace-uncaught` flag can be used to track the exception however this is not ideal. It's highly recommended to only throw objects that derive from the native `Error` constructor, either directly or via inheritance.

## Native Error Constructors

As discussed in the previous section, `Error` is the native constructor for generating an error object. To create an error, call `new Error` and pass a string as a message:

```sh
const myError = new Error('my error')
```

There are six other native error constructors that inherit from the base `Error` constructor, these are:

* EvalError
* SyntaxError
* RangeError
* ReferenceError
* TypeError
* URIError

These error constructors exist mostly for native JavaScript API's and functionality. For instance, a `ReferenceError` will be automatically thrown by the JavaScript engine when attempting to refer to a non-existent reference.

For the most part, there's only two of these error constructors that are likely to be thrown in library or application code, `RangeError` and `TypeError`. Let's update the code from the previous section to use these two error constructors:

```sh
function doTask (amount) {
  if (typeof amount !== 'number') throw new TypeError('amount must be a number')
  if (amount <= 0) throw new RangeError('amount must be greater than zero')
  return amount / 2
}
```
The following is the output of calling `doTask(-1)`:

// MISING-TERMINAL-SCREENSHOT

This time the error message is prefixed with `RangeError` instead of `Error`.

The following is the result of calling `doTask('here is some invalid input')`:

// MISING-TERMINAL-SCREENSHOT

This time the error message is prefixed with `TypeError` instead of `Error`.

## Custom Errors

The native errors are a limited and rudimentary set of errors that can never cater to all possible application errors. There are different ways to communicate various error cases but we will explore two: subclassing native error constructors and use a `code` property. These aren't mutually exclusive.

Let's add a new validation requirement for the doTask function's amount argument, such that it may only contain even numbers.

In our first iteration we'll create an error and add a `code` property:

```sh
function doTask (amount) {
  if (typeof amount !== 'number') throw new TypeError('amount must be a number')
  if (amount <= 0) throw new RangeError('amount must be greater than zero')
  if (amount % 2) {
    const err = Error('amount must be even')
    err.code = 'ERR_MUST_BE_EVEN'
    throw err
  }
  return amount / 2
}

doTask(3)
```

In the next section we'll see how to intercept and identify errors but when this error occurs it can be identified by the code value that was added and then handled accordingly. Node code API's use the approach of creating a native error (either Error or one of the six constructors that inherit from Error) adding a code property. For a list of possible error codes see "Node.js Error Codes".

We can also inherit from Error ourselves to create a custom error instance for a particular use case. Let's create an OddError constructor:

```sh
class OddError extends Error {
  constructor(varName = ''){
    super(varName + ' must be even')
  }

  get name () {
    return 'OddError'
  }
}
```

The `OddError` constructor extends Error and takes an argument called `varName`. In the constructor method we call `super` which calls the parent constructor (which is Error) with a string composed of varName concatenated with the string ' `must be even`'. When instantantiated like so, `new OddError('amount')` this will result in an error message if '`amount must be even`'. Finally we add a `name` getter which returns `'OddError'` so that when the error is displayed in the terminal its `name` corresponds to the `name` of our custom error constructor. Using a `name` getter is a simple way to make the `name` non-enumerable and since it's only accessed in error cases it's fine from a performance perspective to use a getter in this limited case.

Now we'll update `doTask` to use `OddError`:

```sh
function doTask (amount) {
  if (typeof amount !== 'number') throw new TypeError('amount must be a number')
  if (amount <= 0) throw new RangeError('amount must be greater than zero')
  if (amount % 2) throw new OddError('amount')
  return amount / 2
}

doTask(3)
```

The strategies of using a custom error constructor and adding a `code` property are not mutually exclusive, we can do both. Let's update `OddError` like so:

```sh
class OddError extends Error {
  constructor (varName = '') {
    super(varName + ' must be even')
    this.code = 'ERR_MUST_BE_EVEN'
  }

  get name () {
  return 'OddError [' + this.code + ']'
  }
}
```

## Try Catch

When an error is thrown in a normal synchronous function it can be handled with a `try/catch` block.

Using the same code from the previous section, we'll wrap the `doTask(3)` function call with a `try/catch` block:

```sh
try {
  const result = doTask(3)
  console.log('result', result)
} catch (err) {
  console.error(err)
}
```

In this case we controlled how the error was output to the terminal but with this pattern we can also apply any error handling measure as the scenario requires.

Let's update argument passed to `doTask` to a valid input:

```sh
try {
  const result = doTask(4)
  console.log('result', result)
} catch (err) {
  console.error('Error caught: ', err)
}
```

When the invocation is `doTask(4)`, `doTask` does not throw an error and so program execution proceeds to the next line, `console.log('result', result)`, which outputs result 2. When the input is invalid, for instance `doTask(3)` the doTask function will throw and so program execution does not proceed to the next line but instead jumps to the `catch` block.

Rather than just logging the error, we can determine what kind of error has occurred and handle it accordingly:

```sh
try {
  const result = doTask(4)
  console.log('result', result)
} catch (err) {
  if (err instanceof TypeError) {
    console.error('wrong type')
  } else if (err instanceof RangeError) {
    console.error('out of range')
  } else if (err instanceof OddError) {
    console.error('cannot be odd')
  } else {
    console.error('Unknown error', err)
  }
}
```

Let's take the above code but change the input for the `doTask` call in the following three ways:

 * doTask(3)
 * doTask('here is some invalid input')
 * doTask(-1)

If we execute the code after each change, each error case will lead to a different outcome.

The first case causes an instance of our custom `OddError` constructor to be thrown, this is detected by checking whether the caught error (`err`) is an instance of `OddError` and then the message `cannot be odd` is logged. The second scenario leads to an instance of TypeError to be thrown which is determined by checking if err is an instance of `TypeError` in which case wrong type is output. In the third variation and instance of `RangeError` is thrown, the caught error is determined to be an instance of `RangeError` and then out of range is printed to the terminal.

However, checking the instance of an error is flawed, especially when checking against native constructors. Consider the following change to the code:

```sh
try {
  const result = doTask(4)
  result()
  console.log('result', result)
} catch (err) {
  if (err instanceof TypeError) {
    console.error('wrong type')
  } else if (err instanceof RangeError) {
    console.error('out of range')
  } else if (err.code === 'ERR_MUST_BE_EVEN') {
    console.error('cannot be odd')
  } else {
    console.error('Unknown error', err)
  }
}
```

Between calling `doTask` and the console.log the value returned from `doTask(4)` (which will be 2), which is assigned to `result` is called as a function (`result()`). The returned value is a number, not a function so this will result in an error object which, an instance of `TypeError` so the output will be wrong type. This can cause confusion, it's all too easy to assume that the `TypeError` came from `doTask` whereas it was actually generated locally.

To mitigate this, it's better to use duck-typing in JavaScript. This means looking for certain qualities to determine what an object is - e.g. if it looks like a duck, and quacks like a duck it's a duck. To apply duck-typing to error handling, we can follow what Node core APIs do and use a `code` property.

Let's write a small utility function for adding a code to an error object:

```sh
function codify(err, code) {
  err.code = code
  return err
}
```

Now we'll pass the `TypeError` and `RangeError` objects to codify with context specific error codes:

```sh
function doTask(amount) {
  if (typeof amount !== 'number') throw codify(
    new TypeError('amount must be a number'),
    'ERR_AMOUNT_MUST_BE_NUMBER'
  )
  if (amount <= 0) throw codify(
    new RangeError('amount must be greater than zero'),
    'ERR_AMOUNT_MUST_EXCEED_ZERO'
  )
  if (amount % 2) throw new OddError('amount')
  return amount/2
}
```
Finally we can update the catch block to check for the `code` property instead of using an instance check:

```sh
try {
  const result = doTask(4)
  result()
  console.log('result', result)
} catch (err) {
  if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
    console.error('wrong type')
  } else if (err.code === 'ERRO_AMOUNT_MUST_EXCEED_ZERO') {
    console.error('out of range')
  } else if (err.code === 'ERR_MUST_BE_EVEN') {
    console.error('cannot be odd')
  } else {
    console.error('Unknown error', err)
  }
}
```

Now erroneously calling result as a function will cause the error checks to reach the final else branch in the `catch` block.

It's important to realize that `try/catch` cannot catch errors that are thrown in a callback function that is called at some later point. Consider the following:

```sh
// WARNING: NEVER DO THIS:
try {
  setTimeout(() => {
    const result = doTask(3)
    console.log('result', result)
  }, 100)
} catch (err) {
  if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
    console.error('wrong type')
  } else if (err.code === 'ERRO_AMOUNT_MUST_EXCEED_ZERO') {
    console.error('out of range')
  } else if (err.code === 'ERR_MUST_BE_EVEN') {
    console.error('cannot be odd')
  } else {
    console.error('Unknown error', err)
  }
}
```

The `doTask(3)` call will throw an `OddError` error, but this will not be handled in the catch block because the function passed to `setTimeout` is called a hundred milliseconds later. By this time the `try/catch` block has already been executed, so this will result in the error not being handled.

When encountering such an antipattern, an easy fix is to move the `try/catch` into the body of the callback function:

```sh
setTimeout(() => {
  try {
    const result = doTask(3)
    console.log('result', result)
  } catch (err) {
    if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
      console.error('wrong type')
    } else if (err.code === 'ERRO_AMOUNT_MUST_EXCEED_ZERO') {
      console.error('out of range')
    } else if (err.code === 'ERR_MUST_BE_EVEN') {
      console.error('cannot be odd')
    } else {
      console.error('Unknown error', err)
    }
  }
}, 100)
```

## Rejections

`Promise` abstractions and `async/await` syntax. So far we have dealt with errors that occur in a synchronous code. Meaning, that a throw occurs in a normal synchronous function (one that isn't `async/await`, promise-based or callback-based). When a throw in a synchronous context is known as an exception. When a promise rejects, it's representing an asynchronous error. One way to think about exceptions and rejections is that exceptions are synchronous errors and rejections are asynchronous errors.

Let's imagine that `doTask` has some asynchronous work to do, so we can use a callback based API or we can use a promise-based API (even `async/await` is promise-based).

Let's convert `doTask` to return a promise that `resolves` to a value or `rejects` if there's an error:

```sh
function doTask(amount) {
  return new Promise((resolve, reject) => {
    if (typeof amount !== 'number') {
      reject(new TypeError('amount must be a number'))
      return
    }
    if (amount <= 0) {
      reject(new RangeError('amount must be greater than zero'))
      return
    }
    if (amount % 2) {
      reject(new OddError('amount'))
      return
    }
    resolve(amount/2)
  }) 
}

doTask(3)
```

The promise is created using the `Promise` constructor, see MDN web docs - "Constructor Syntax" for full details. The function passed to `Promise` is called the tether function, it takes two arguments, `resolve` and `reject` which are also functions. We call `resolve` when the operation is a success, or `reject` when it is a failure. In this conversion, we're passing an error into `reject` for each of our error cases so that the returned promise will `reject` when doTask is passed invalid input.

Calling `doTask` with an invalid input, as in the above, will result in an unhandled rejection.

The rejection is unhandled because promises must use the catch method to catch rejections and so far we haven't attached a `catch` handler. Let's modify the `doTask` call to the following:

```sh
doTask(3)
  .then((result) => {
    console.log('result', result)
  })
  .catch((err) => {
    if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
      console.error('wrong type')
    } else if (err.code === 'ERRO_AMOUNT_MUST_EXCEED_ZERO') {
      console.error('out of range')
    } else if (err.code === 'ERR_MUST_BE_EVEN') {
      console.error('cannot be odd')
    } else {
      console.error('Unknown error', err)
    }

  })
```

Now this is functionality equivalent to the synchronous non-promise based form of our code, the error are handled in the same way.

A then handler was also added alongside a catch handler, so when the `doTask` function is successful the result will be logged out. Here's what happens if we change `doTask(3)` in the above code to `doTask(4)`.

It's very important to realize that when the `throw` appears inside a promise handler, that will not be an exception, that is it won't be an error that is synchronous. Instead it will be a rejection, the then or `catch` handler will return a new promise that rejects as a result of a `throw` within a handler.

Let's modify the then handler so that a `throw` occurs inside the handler function:

```sh
doTask(4)
  .then((result) => {
    throw Error('spanner in the works')
  })
  .catch((err) => {
    if (err instanceof TypeError) {
      console.error('wrong type')
    } else if (err instanceof RangeError) {
      console.error('out of range')
    } else if (err.code === 'ERR_MUST_BE_EVEN') {
      console.error('cannot be odd')
    } else {
      console.error('Unknown error', err)
    }
  })
```

Even though `doTask(4)` does not cause a promise rejection, the throw in the `then` handler does. So the `catch` handler on the promise returned from `then` will reach the final `else` branch and output unknown error. Bear in mind that functions can call functions, so any function in a call stack of functions that originates in a then handler could throw, which would result in a rejection instead of the normally anticipated exception.

## Async Try Catch

The `async/await` syntax supports `try/catch` of rejections. In other words we can use try/catch on asynchronous promise-based APIs instead of using then and catch handler as in the next section, let's create a async function named run and reintroduce the same try/catch pattern that was used when calling the synchronous form of `doTask`:

```sh
async function run () {
  try {
    const result = await doTask(3)
    console.log('result', result)
  } catch (err) {
    if (err instanceof TypeError) {
      console.error('wrong type')
    } else if (err instanceof RangeError) {
      console.error('out of range')
    } else if (err.code === 'ERR_MUST_BE_EVEN') {
      console.error('cannot be odd')
    } else {
      console.error('Unknown error', err)
    }
  }
}

run()
```

The only difference, other than wrapping the `try/catch` in an async function, is that we await doTask(3) so that the async function can handle the promise automatically. Since 3 is an odd number, the promise returned from doTask will call reject with our custom OddError and the catch block will identify the code property and then output cannot be odd:

Using an async function with a `try/catch` around an awaited promise is syntactic sugar. The `catch` block in the `async` run function is the equivalent of the catch method handler in the previous section. An `async` function always returns a promise that resolves to the returned value, unless a throw occurs in that `async` function, in which case the returned promise rejects. This means we can convert our `doTask` function from returning a promise where we explicitly call reject within a `Promise` tether function to simply throwing again.

Essentially we can convert `doTask` to its original synchronous form but prefix `async` to the function signature, like so:

```sh
async function doTask (amount) {
  if (typeof amount !== 'number') throw new TypeError('amount must be a number')
  if (amount <= 0) throw new RangeError('amount must be greater than zero')
  if (amount % 2) throw new OddError('amount')
  return amount/2
}
```

This is, again, the same functionality as the synchronous version but it allows for the possibility of doTask to perform other asynchronous tasks, for instance making a request to an HTTP server, writing a file or reading from a database. All of the errors we've been creating and handling are developer errors but in an asynchronous context we're more likely to encounter operational errors. For instance, imagine that an HTTP request fails for some reason - that's an asynchronous operational error and we can handle it in exactly the same way as the developer errors we're handling in this section. That is, we can await the asynchronous operation and then catch any operational errors as well.

By means of example let's imagine we have a function call asyncFetchResult that makes an HTTP request, sending the amount to another HTTP server for it to be processed. If the other server is successful the promise returned from asyncFetchResult resolves to the value provided by the HTTP service. If the fetch request is unsuccessful for any reason (either because of a network error, or an error in the service) then the promise will reject. We could use the asyncFetchResult function like so:

```sh
async function doTask (amount) {
  if (typeof amount !== 'number') throw new TypeError('amount must be a number')
  if (amount <= 0) throw new RangeError('amount must be greater than zero')
  if (amount % 2) throw new OddError('amount')
  const result = await asyncFetchResult(amount)
  return result
}
```

It's important to note that asyncFetchResult is an imaginary function for conceptual purposes only in order to explain the utility of this approach so the above code will not work. However conceptually speaking, in the case where the promise returned from asyncFetchResult rejects this will cause the promise returned from doTask to reject (because the promise returned from asyncFetchResult is awaited). That would trigger in turn the catch block in the run async function. So the catch block could then be extended to handle that operational error. This is error propagation in an async/await context. In the next and final section we will explore propagating errors in synchronous function, async/await and promise and callback-based scenarios.

## Propagation

Error propagation is where, instead of handling the error, we make it the responsibility of the caller instead. We have a doTask function that may throw, and a run function which calls doTask and handles the error. When using async/await functions if we want to propagate an error we simply rethrow it.

The following is the full implementation of our code in async/await form with run handling known errors but propagating unknown errors:

```sh
class OddError extends Error {
  constructor (varName = '') {
    super(varName + ' must be even')
    this.code = 'ERR_MUST_BE_EVEN'
  }
  get name () {
    return 'OddError [' + this.code + ']'
  }
}

function codify (err, code) {
  err.code = code
  return err
}

async function doTask (amount) {
  if (typeof amount !== 'number') throw codify(
    new TypeError('amount must be a number'),
    'ERR_AMOUNT_MUST_BE_NUMBER'
  )
  if (amount <= 0) throw codify(
    new RangeError('amount must be greater than zero'),
    'ERR_AMOUNT_MUST_EXCEED_ZERO'
  )
  if (amount % 2) throw new OddError('amount')
  throw Error('some other error')
  return amount/2
}

async function run () {
  try {
    const result = await doTask(4)
    console.log('result', result)
  } catch (err) {
    if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
      throw Error('wrong type')
    } else if (err.code === 'ERRO_AMOUNT_MUST_EXCEED_ZERO') {
      throw Error('out of range')
    } else if (err.code === 'ERR_MUST_BE_EVEN') {
      throw Error('cannot be odd')
    } else {
      throw err
    }
  }
}
run().catch((err) => { console.error('Error caught', err) })
```

For purposes of explanation the doTask function unconditionally throws an error when input is valid so that we show the error propagation. The error doesn't correspond to any of the known errors and so instead of logging it out, it is rethrown. This causes the promise returned by the run async function to reject, thus triggering the catch handler which is attached to it. This catch handler logs out Error caught along with the error.

Error propagation for synchronous code is almost exactly the same, syntactically. We can convert doTask and run into non-async functions by removing the async keyword:

```sh
function doTask (amount) {
  if (typeof amount !== 'number') throw codify(
    new TypeError('amount must be a number'),
    'ERR_AMOUNT_MUST_BE_NUMBER'
  )
  if (amount <= 0) throw codify(
    new RangeError('amount must be greater than zero'),
    'ERR_AMOUNT_MUST_EXCEED_ZERO'
  )
  if (amount % 2) throw new OddError('amount')
  throw Error('some other error')
  return amount/2
}

function run () {
  try {
    const result = doTask('not a valid input')
    console.log('result', result)
  } catch (err) {
    if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
      throw Error('wrong type')
    } else if (err.code === 'ERRO_AMOUNT_MUST_EXCEED_ZERO') {
      throw Error('out of range')
    } else if (err.code === 'ERR_MUST_BE_EVEN') {
     throw Error('cannot be odd')
    } else {
      throw err
    }
  }
}

try { run() } catch (err) { console.error('Error caught', err) }
```

In addition to removing the async keyword remove the await keyword from within the try block of the run function because we're now back to dealing with synchronous execution. The doTask function returns a number again, instead of a promise. The run function is also now synchronous, since the async keyword was removed it no longer returns a promise. This means we can't use a catch handler, but we can use try/catch as normal. The net effect is that now a normal exception is thrown and handled in the catch block outside of run.

Finally for the sake of exhaustive exploration of error propagation we'll look at the same example using callback-based syntax. In Section 8 - "Asynchronous Control Flow" we explore error-first callbacks, convert doTask to pass errors as the first argument of a callback:

```sh
function doTask (amount, cb) {
  if (typeof amount !== 'number') {
    cb(codify(
      new TypeError('amount must be a number'),
      'ERR_AMOUNT_MUST_BE_NUMBER'
    ))
    return
  }
  if (amount <= 0) {
    cb(codify(
      new RangeError('amount must be greater than zero'),
      'ERR_AMOUNT_MUST_EXCEED_ZERO'
    ))
    return
  }
  if (amount % 2) {
    cb(new OddError('amount'))
    return
  }
  cb(null, amount/2)
}
```

The doTask function now takes two arguments, amount and cb. Let's insert the same artificial error as in the other examples, in order to demonstrate error propagation:

```sh
function doTask (amount, cb) {
  if (typeof amount !== 'number') {
    cb(codify(
      new TypeError('amount must be a number'),
     'ERR_AMOUNT_MUST_BE_NUMBER'
    ))
    return
  }
  if (amount <= 0) {
    cb(codify(
      new RangeError('amount must be greater than zero'),
      'ERR_AMOUNT_MUST_EXCEED_ZERO'
    ))
    return
  }
  if (amount % 2) {
    cb(new OddError('amount'))
    return
  }
  cb(Error('some other error'))
  return
  cb(null, amount/2)
}
```

Similarly the run function has to be adapted to take a callback (cb) so that errors can propagate via that callback function. When calling doTask we need to now supply a callback function and check whether the first err argument of the callback is truthy to generate the equivalent of a catch block:

```sh
function run (cb) {
  doTask(4, (err, result) => {
    if (err) {
      if (err.code === 'ERR_AMOUNT_MUST_BE_NUMBER') {
        cb(Error('wrong type'))
      } else if (err.code === 'ERRO_AMOUNT_MUST_EXCEED_ZERO') {
        cb(Error('out of range'))
      } else if (err.code === 'ERR_MUST_BE_EVEN') {
        cb(Error('cannot be odd'))
      } else {
        cb(err)
      }
      return
    }

    console.log('result', result)
  })
}

run((err) => {
  if (err) console.error('Error caught', err)
})
```

Finally, at the end of the above code we call run and pass it a callback function, which checks whether the first argument (err) is truthy and if it is the error is logged as the way as in the other two forms.

Much like using async/await or Promises this callback-based form isn't necessary unless we also have asynchronous work to do. We've explored examples where some errors are handled whereas others are propagated based on whether the error can be identified. Whether or not an error is propagated is very much down to context. Other reasons to propagate an error might be when error handling strategies have failed at a certain level. For instance retrying a network request a certain amount of times before propagating an error. Generally speaking, try to propagate errors for handling at the highest level possible. In a module this is the main file of the module, in an application this is in the entry point file