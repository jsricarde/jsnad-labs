### Callback

A callback is a function that will be called at some future point, once a task has been completed. Until the fairly recent introduction of async/await, which will be discussed shortly, callback functions were the only way to manage asynchronous flow.

Let's take a look at an example readFile call:

```sh
const { readFile } = require('fs')

readFile(__filename (err, content) => {
  if(err) { 
    console.error(err)
    return
  }
  return content.toString()
})
```

If this is placed into a file and executed the program will read its own source code and print it out. To understand why it loads itself, it's important to know that `_filename` in Node.js holds the path of the file currently being executed. This is the first argument passed to `readFile`. The `readFile` function schedules a task, which is to read the given file. When the file has been read, the `readFile` function will call the function provided as the second argument.

The second argument to `readFile` is a function that has two parameters, err and `contents`. This function will be called when `readFile` has completed its task. If there was an error, then the first argument passed to the function will be an error object representing that error, otherwise it will be `null`. Always having an error as the first parameter is convention in Node, this type of error-first callback is known as an Errback.

If the `readFile` function is successful, the first argument (`err`) will be `null` and the second argument (`contents`) will be the `contents` of the file.

The time it takes to complete an operation will be different depending on the operation. For instance if three files of significantly different sizes were read, the callback for each `readFile` call would be called relative to the size of the file regardless of which order they began to be read.

Imagine a program with three variables, `smallFile`, `mediumFile`, `bigFile` each which holds a string pointing to the path of a file of a greater size than the last. If we want to log out the `contents` of each file based on when that file has been loaded, we can do something like the following:

```sh
const { readFile } = require('fs')
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3).fill(__filename))

const print = (err, contents) => {
  if(err) {
    console.error(err)
    return
  }
  console.log(contents.toString())
}

readFile(bigFile, print)
readFile(mediumFile, print)
readFile(smallFile, print)
```

On line two `smallFile`, `mediumFile`, and `bigFile` are mocked (i.e. it's pretend) and they're actually all the same file. The actual file they point to doesn't matter, it only matters that we understand they represent different file sizes for the purposes of understanding.

If the files were genuinely different sizes, the above would print out the contents of `smallFile` first and `bigFile` last even though the `readFile` operation for `bigFile` was called first. This is one way to achieve parallel execution in Node.js.

What if we wanted to use serial execution, let's say we want `bigFile` to print first, then `mediumFile` even though they take longer to load than `smallFile`. Well now the callbacks have to be placed inside each other:

```sh
const { readFile } = require('fs')
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3).fill(__filename))

const print = (err, contents) => {
  if(err) {
    console.error(err)
    return
  }
  console.log(contents.toString())
}
readFile(bigFile (err, contents) => {`1
  print(err, contents)
  readFile(mediumFile (err, contents) => {
    print(err, contents)
    readFile(mediumFile (err, contents) => {
      print(err, contents)
    })
  })
})
```

Serial execution with callbacks is achieved by waiting for the callback to call before starting the next asynchronous operation.

What if we want all of the contents of each file to be concatenated together and logged once all files are loaded?

The following example pushes the contents of each file to an array and then logs the array when all files are loaded:

```sh
const { readFile } = require('fs')
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)
const data = []
const print = (err, contents) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(contents.toString())
}
readFile(bigFile, (err, contents) => {
  if (err) print(err)
  else data.push(contents)
  readFile(mediumFile, (err, contents) => {
    if (err) print(err)
    else data.push(contents)
    readFile(smallFile, (err, contents) => {
      if (err) print(err)
      else data.push(contents)
      print(null, Buffer.concat(data))
    })
  })
})
```

So far we've used three asynchronous operations, but how would an unknown amount of asynchronous operations be supported? Let's say we have a `files` array instead. Like the `smallFile`, `mediumFile` and `bigFile` variables, the `files` array is also conceptual purposes. The idea is that `files` array could be any length and the goal is to print all the file contents out in the order they appear in the array:

```sh
const { readFile } = require('fs')

const files = Array.from(Array(3)).fill(__filename)
const data = []

const print = (err, contents) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(contents.toString())
}
const count = files.length
let index = 0
const read = (file) => {
  readFile(file, (err, contents) => {
    index+1
    if(err) print(err)
    else data.push(contacts)
    if (index < count) {
      read(files[index])
    } else {
      print(null, Buffer.concat(data))
    } 
  })
}
read(files[index])
```

In this case a self-recursive function, read, is created along with two variables, count and index. The count variable is the amount of files to read, the index variable is used to track which file is currently being read. Once a file has been read and added to the data array read is called again if index < count. Otherwise the data array is concatenated and printed out. To reiterate, it doesn't matter that these operations happen to be file reading operations. Control flow patterns apply universally to all asynchronous operations.

Callback-based serial execution can become quite complicated, quite quickly. Using a small library to manage the complexity is advised. One library that can be used for this is fastseries 

The following is the same serial execution with fastseries:

```sh
const { readFile } = require('fs')
const { series } = require('fastseries')
const files = Array.from(Array(3)).fill(__filename)
const data = []

const print = (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(Buffer.concat(data).toString())
}

const readers = files.map((file) => {
  return (_, cb) => {
    readFile(file, (err, contents) => {
      if (err) cb(err)
      else cb(null, contents)
    })
  }
})

series(null, readers, null, print)
```

Here the array of files is mapped into an array of functions that fastseries can consume. This array of function is assigned to readers and passed as the second argument to series. The mapped functions have two parameters. The second parameter is cb, the callback function which we must call to let fastseries know we have finished an asynchronous operation so that it can move on to processing the function in the readers array.

The cb function takes two arguments, the first is the error object or null (depending on whether there was an error). The second is the result of the asynchronous operation - which is called contents here. The first parameter of the mapped function (readers) will be whatever the last result was. Since we don't use that parameter, we assigned the parameter to an underscore (_) to signal it's not of interest for this case. The final parameter passed to series is print, this will be called when all the readers have been processed by fastseries. The second argument of print is called data here, fastseries will pass an array of all the results to print.

## Promises

A promise is an object that represents an asynchronous operation. It's either pending or settled, and if it is settled it's either resolved or rejected. Being able to treat an asynchronous operation as an object is a useful abstraction. For instance, instead of passing a function that should be called when an asynchronous operation completes into another function (eg. a callback), a promise that represents the asynchronous operation can be returned from a function instead.

Let's consider the two approaches, the following is a callback-based approach:

```sh
function myAsyncOperation (cb) {
doSomethingAsynchronous((err, value) => { cb(err, value) })
}

myAsyncOperation(functionThatHandlesTheResult)
```

Now let's consider the same in promise form:

```sh
function myAsyncOperation() {
  return new Promise((resolve, reject) => {
    doSomethingAsynchronous((err, value) => {
      if (err) reject(err)
      else resolve(value)
    })
  })
}

const promise = myAsyncOperation()
// next up: do something with promise
```
Instead of `myAsyncOperation` taking a `callback`, it returns a `promise`. The imaginary `doSomethingAsynchronous` function is `callback` based, so it has to be wrapped in a promise. To achieve this the `Promise` constructor is used, it's passed a function called the executor function which has two parameters: `resolve` and `reject`. In error cases the error object is passed to `reject`, in success cases the asynchronously resolved value is passed to `resolve`.

In Node there is a nicer way to this with the `promisify` function from the `util` module:

```sh
const { promisify } = require('util')
const { readFile } = require('fs')

const readFileProm = promisify(readFile)

const promise = readFileProm(__filename)
.then((contents) => console.log(contents.toString())
.catch(err => console.error(err))
```

This will result in the file printing itself. Here we have the same `readFile` operation as in the last section, but the `promisify` function is used to convert a callback-based API to a promise-based one. When it comes to the `fs` module we don't actually have to do this, the `fs` module exports a promises object with promise-based versions. Let's rewrite the above in a more condensed form:

```sh
const { readFile } = require('fs').promises

readFile(__filename)
.then((contents) => console.log(contents.toString())
.catch(err => console.error(err))
```

This time we've used the ready-made promise-based `readFile` function, used chaining for the catch and we pass `console.error` directly to catch instead of using an intermediate function.

If a value is returned from `then`, the `then` method will return a promise that resolves to that value:

```sh
const { readFile } = require('fs').promises

readFile(__filename)
  .then((contents) => {
    return contents.toString()
  })
  .then((stringifiedContents) => {
    console.log(stringifiedContents)
  })
  .catch(console.error)
```

In this case the first then handler returns a promise that resolves to the stringified version of contents. So when the second then is called on the result of the first then the handler of the second then is called with the stringified contents. Even though an intermediate promise is created by the first then we still only need the one catch handler as rejections are propagated.

If a promise is returned from a then handler, the then method will return that promise, this allows for an easy serial execution pattern:

```sh
const { readFile } = require('fs').promises
const [ bigFile, mediumFile, smallFile] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
  console.log(contents.toString())
}

readFile(bigFile)
.then(contents => {
  print(contents)
  return readFile(mediumFile)
})
.then(contents => {
  print(contents)
  return readFile(smallFile)
})
.then(print)
.catch(console.error)
```

Once `bigFile` has been read, the first then handler returns a promise for reading `mediumFile`. The second then handler receives the contents of `mediumFile` and returns a promise for reading `smallFile`. The third then handler is the prints the contents of the `smallFile` and returns itself. The catch handler will handle errors from any of the intermediate promises.

Let's consider the same scenario of the files array that we dealt with in the previous section. Here's how the same behavior could be achieved with promises:

```sh
const { readFile } = require('fs').promises
const files = Array.from(Array(3)).fill(__filename)
const data = []
const print = (contents) => {
  console.log(contents.toString())
}
let count = files.length
let index = 0
const read = (file) => {
  return readFile(file).then((contents) => {
    index += 1
    data.push(contents)
    if (index < count) return read(files[index])
    return data
  })
}

read(files[index])
  .then((data) => {
    print(Buffer.concat(data))
  })
  .catch(console.error)
```

The complexity here is about the same as a callback based approach. However, we will see later that combining promises with async/await drastically reduces the complexity of serial execution. As with the callback-based example, we use a data array and count and index variables. But a then handler is called on the readFile promise, and if index < count the then handler returns a promise of read for the next file in the array. This allows us to neatly decouple the fetching of the data from the printing of the data. The then handler near the bottom of the code receives the populated data array and prints it out.

Depending on what we are trying to achieve there is a much simpler way to achieve the same effect without it being serially executed:

```sh
const { readFile } = require('fs').promises
const files = Array.from(Array(3)).fill(__filename)
const print = (data) => {
  console.log(Buffer.concat(data).toString())
}

const readers = files.map((file) => readFile(file))

Promise.all(readers)
  .then(print)
  .catch(console.error)
```

The `Promise.all` function takes an array of promises and returns a promise that resolves when all promises have been resolved. That returned promise resolves to an array of the values for each of the promises. This will give the same result of asynchronously reading all the files and concatenating them in a prescribed order, but the promises will run in parallel. For this case that's even better.

However if one of the promises was to fail, Promise.all will reject, and any successfully resolved promises are ignored. If we want more tolerance of individual errors, `Promise.allSettled` can be used:

```sh
const { readFile } = require('fs').promises
const files = [__filename, 'not a file', __filename]
const print = (results) => {
  results
    .filter(({status}) => status === 'rejected')
    .forEach(({reason}) => console.error(reason))
  const data = results
    .filter(({status}) => status === 'fulfilled')
    .map(({value}) => value)
  const contents = Buffer.concat(data)
  console.log(contents.toString())
}

const readers = files.map((file) => readFile(file))

Promise.allSettled(readers)
  .then(print)
  .catch(console.error)
```

The `Promise.allSettled` function returns an array of objects representing the settled `status` of each promise. Each object has a `status` property, which may be `rejected` or `fulfilled` (which means resolved). Objects with a rejected `status` will contain a `reason` property containing the error associated with the rejection. Objects with a fulfilled `status` will have a `value` property containing the resolved value. We filter all the rejected settled objects and pass the `reason` of each to `console.error`. Then we filter all the `fulfilled` settled objects and create an array of just the values using `map`. This is the `data` array, holding all the buffers of successfully read files.

Finally, if we want promises to run in parallel independently we can either use `Promise.anySettled` or simple execute each of them with their own then and catch handlers:

```sh
const { readFile } = require('fs').promises
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
  console.log(contents.toString())
}

readFile(bigFile).then(print).catch(console.error)
readFile(mediumFile).then(print).catch(console.error)
readFile(smallFile).then(print).catch(console.error)
```

## Async/Await

The keywords `async` and `await` allow for an approach that stylistic looks a very similar to synchronous code. The `async` keyword is used before a function to declare an async function:

```sh
async function myFunction() {}
```

An async function always returns a promise. The promise will resolve to whatever is returned inside the async function body.

The `await` keyword can only be used inside of `async` functions. The `await` keyword can be used with a promise, this will pause the execution of the async function until the awaited promise is resolved. The resolved value of that promise will be returned from an `await` expression.

```sh
const { readFile } = require('fs').promises

async function run() {
  const contents = await readFile(__filename)
  console.log(contents.toString())
}

myFunction()
.catch(conosle.error)
```

We create an async function called `run`. Within the function we use the `await` keyword on the return value of `readFile(__filename)`, which is a promise. The execution of the `run` async function is paused until `readFile(__filename)` resolves. When it resolves the contents constant will be assigned the resolve value. Then we log the contents out.

To start the async function we call it like any other function. An async function always returns a promise, so we call the `catch` method to ensure that any rejections within the async function are handled. For instance, if `readFile` had an error, the awaited promise would reject, this would make the run function reject and we'd handle it in the catch handler.

The async/await syntax enables the cleanest approach to serial execution.

The following is the sequential execution of varying file sizes example adapted to async/await:

```sh
const { readFile } = require('fs').promises

const print = (contents) => {
  console.log(contents.toString())
}
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

async function run() {
  print(await readFile(bigFile))
  print(await readFile(mediumFile))
  print(await readFile(smallFile))
}

run()
.cacth(console.error)
```

To determine the order in which we want operations to resolve in async/await we simply await those operations in that order.

Concatenating files after they've been loaded is also trivial with async/await:

```sh
const { readFile } = require('fs').promises
const print = (contents) => {
  console.log(contents.toString())
}
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

async function run () {
  const data = [
    await readFile(bigFile),
    await readFile(mediumFile),
    await readFile(smallFile)
  ]
  print(Buffer.concat(data))
}

run().catch(console.error)
```

Notice that we did not need to use `index` or `count` variables to track asynchronous execution of operations. We were also able to populate the `data` array declaratively instead of pushing state into it. The async/await syntax allows for declarative asynchronous implementations.

What about the scenario with a files array of unknown length? The following is an async/await approach to this:

```sh
const { readFile } = require('fs').promises

const print = (contents) => {
  console.log(contents.toString())
}

const files = Array.from(Array(3)).fill(__filename)

async function run () {
  const data = []
  for (const file of files) {
    data.push(await readFile(file))
  }
  print(Buffer.concat(data))
}

run().catch(console.error)
```

Here we use an `await` inside a loop. For scenarios where operations *must* be sequentially called this is fitting. However for scenarios where the output only has to be ordered, but the order in which asynchronous operations resolves is immaterial we can again use `Promise.all` but this time `await` the promise that `Promise.all` returns:

```sh
const { readFile } = require('fs').promises
const files = Array.from(Array(3)).fill(__filename)
const print = (contents) => {
  console.log(contents.toString())
}

async function run () {
  const readers = files.map((file) => readFile(file))
  const data = await Promise.all(readers)
  print(Buffer.concat(data))
}

run().catch(console.error)
```

Here we use `map` on the files `array` to create an array of promises as returned from `readFile`. We call this array readers. Then we await `Promise.all(readers)` to get an array of buffers. At this point it's the same as the data array we've seen in prior examples. This is parallel execution with sequentially ordered output.

As before, `Promise.all` will atomically reject if any of the promises fail. We can again use `Promise.allSettled` to tolerate errors in favor of getting necessary data:

```sh
const { readFile } = require('fs').promises
const files = [__filename, 'foo', __filename]
const print = (contents) => {
  console.log(contents.toString())
}

async function run () {
  const readers = files.map((file) => readFile(file))
  const results = await Promise.allSettled(readers)

  results
    .filter(({status}) => status === 'rejected')
    .forEach(({reason}) => console.error(reason))

  const data = results
    .filter(({status}) => status === 'fulfilled')
    .map(({value}) => value)

  print(Buffer.concat(data))
}

run().catch(console.error)
```

The async/await syntax is highly specialized for serial control flow. The trade-off is that parallel execution in async functions with using `Promise.all`, `Promise.allSettled`, `Promise.any` or `Promise.race` can become difficult or unintuitive to reason about.

To get the exact same parallel operation behavior as in the initial callback example within an `async` function so that the files are printed as soon as they are loaded we have to create the promises, use a `then` handler and then `await` the promises later on:

```sh
const { readFile } = require('fs').promises
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const print = (contents) => {
  console.log(contents.toString())
}

async function run () {
  const big = readFile(bigFile)
  const medium = readFile(mediumFile)
  const small = readFile(smallFile)

  big.then(print)
  medium.then(print)
  small.then(print)

  await small
  await medium
  await big
}

run().catch(console.error)
```

This will ensure the contents are printed out chronologically, according to the time it took each of them to load. If the complexity for parallel execution grows it may be better to use a callback based approach and wrap it at a higher level into a promise so that it can be used in an async/await function:

```sh
const { promisify } = require('util')
const { readFile } = require('fs')
const [ bigFile, mediumFile, smallFile ] = Array.from(Array(3)).fill(__filename)

const read = promisify((cb) => {
  let index = 0
  const print = (err, contents) => {
    index += 1
    if (err) {
      console.error(err)
      if (index === 3) cb()
      return
    }
    console.log(contents.toString())
    if (index === 3) cb()
  }
  readFile(bigFile, print)
  readFile(mediumFile, print)
  readFile(smallFile, print)
})

async function run () {
  await read()
  console.log('finished!')
}

run().catch(console.error
```
Here we've wrapped the callback-based parallel execution approach into a function that accepts a callback (`cb`) and we've passed that whole function into `promisify`. This means that our `read` function returns a promise that resolves when all three parallel operations are done, after which the run function logs out: finished!