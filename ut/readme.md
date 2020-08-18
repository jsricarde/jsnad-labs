## Assertions

An assertion checks a value for a given condition and throws if that condition is not met. The core `assert` module exports a function that will throw an `AssertionError` when the value passed to it is falsy (meaning that the value can be coerced to false with `!!val`):

```sh
node -e "assert(false)"
```
returns an `AssertError`

Since the Node core `assert` module does not output anything for success cases there is no `assert.pass` method as it would be behaviorally the same as doing nothing.

We can group the assertions into the following categories:

- Truthiness (assert and assert.ok)
- Equality (strict and loose) and Pattern Matching (match)
- Deep equality (strict and loose)
- Errors (ifError plus throws, rejects and their antitheses)
- Unreachability (fail)

### Strict equal assertion

Since `assert.strictEqual` checks both value and type, using the triple equals operator (===) if add does not return 4 as a number an AssertionError will be thrown.

```sh
const assert = require('assert')
const add = require('./get-add-from-somewhere.js')
assert.strictEqual(add(2, 2), 4)
```

The assert module also exposes a strict object where namespaces for non-strict methods are strict, so the above code could also be written as:

```sh
const assert = require('assert')
const add = require('./get-add-from-somewhere.js')
assert.strict.equal(add(2, 2), 4)
```

There are assertion libraries in the ecosystem which introduce alternative APIs but at a fundamental level, work in the same way. That is, an assertion error will be thrown if a defined condition is not met.

Let's take a look at an equivalent example using the fluid API provided by the `expect` library.

```sh
const expect = require('expect')
const add = require('./get-add-from-somewhere.js')

expect(add(2, 2)).toStrictEqual(4)
```

With the `expect` assertion library, the value that we are asserting against is passed to the `expect` function, which returns an object with assertion methods that we can call to validate that value. In this case, we call `toStrictEqual` to apply a strict equality check. For a coercive equality check we could use `expect(add(2, 2).toBe(4)`.

If an assertion fails, the `expect` library will throw a `JestAssertionError`, which contains extra information and prettier output than the core `AssertionError` instances

### Deep Equality methods

Deep equality methods, such as assert.deepEqual traverse object structures and then perform equality checks on any primitives in those objects. Let's consider the following object:

```sh
const obj = { id: 1, name: { first: 'David', second: 'Clements' } }
```

To compare this object to another object, a simple equality check won't do because equality in JavaScript is by reference for objects:

```sh
const assert = require('assert')
const obj = {
  id: 1,
  name: { first: 'David', second: 'Clements' }
}
// this assert will fail because they are different objects:
assert.equal(obj, {
  id: 1,
  name: { first: 'David', second: 'Clements' }
})
```

To compare object structure we need a deep equality check:

```sh
const assert = require('assert')
const obj = {
  id: 1,
  name: { first: 'David', second: 'Clements' }
}
assert.deepEqual(obj, {
  id: 1,
  name: { first: 'David', second: 'Clements' }
})
```

The difference between `assert.deepEqual` and `assert.deepStrictEqual` (and `assert.strict.deepEqual`) is that the equality checks of primitive values (in this case the id property value and the name.first and name.second strings) are coercive, which means the following will also pass:

```sh
const assert = require('assert')
const obj = {
  id: 1,
  name: { first: 'David', second: 'Clements' }
}
// id is a string but this will pass because it's not strict
assert.deepEqual(obj, {
  id: '1',
  name: { first: 'David', second: 'Clements' }
})
```

It's recommended to use strict equality checking for most cases:

```sh
const assert = require('assert')
const obj = {
  id: 1,
  name: { first: 'David', second: 'Clements' }
}
// this will fail because id is a string instead of a number
assert.strict.deepEqual(obj, {
  id: '1',
  name: { first: 'David', second: 'Clements' }
})
```

### Error Handling Assertions

The error handling assertions (`throws`, `ifError`, `rejects`) are useful for asserting that error situations occur for synchronous, callback-based and promise-based APIs.

Let's start with an error case from an API that is synchronous:

```sh
const assert = require('assert')
const add = (a, b) => {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw Error('inputs must be numbers')
  }
  return a + b
}
assert.throws(() => add('5', '5'), Error('inputs must be numbers'))
assert.doesNotThrow(() => add(5, 5))
```

Notice that the invocation of add is wrapped inside another function. This is because the `assert.throws` and `assert.doesNotThrow` methods have to be passed a function, which they can then wrap and call to see if a throw occurs or not. When executed the above code will pass, which is to say, no output will occur and the process will exit.

For callback-based APIs, the `assert.ifError` will only pass if the value passed to it is either null or undefined. Typically the err param is passed to it, to ensure no errors occurred:

```sh
const assert = require('assert')
const pseudoReq = (url, cb) => {
  setTimeout(() => {
    if (url === 'http://error.com') cb(Error('network error'))
    else cb(null, Buffer.from('some data'))
  }, 300)
}

pseudoReq('http://example.com', (err, data) => {
  assert.ifError(err)
})

pseudoReq('http://error.com', (err, data) => {
  assert.deepStrictEqual(err, Error('network error'))
})
```

We create a function called `pseudoReq` which is a very approximated emulation of a URL fetching API. The first time we call it with a string and a callback function we pass the err parameter to `assert.ifError`. Since err is null in this scenario, `assert.ifError` does not throw an `AssertionError`. The second time we call `pseudoReq` we trigger an error. To test an error case with a callback API we can check the `err` param against the expected error object using `assert.deepStrictEqual`.

Finally for this section, let's consider asserting error or success states on a promise-based API:

```sh
const assert = require('assert')
const { promisify } = require('util')
const timeout = promisify(setTimeout)
const pseudoReq = async (url) => {
  await timeout(300)
  if (url === 'http://error.com') throw Error('network error')
  return Buffer.from('some data')
}
assert.doesNotReject(pseudoReq('http://example.com'))
assert.rejects(pseudoReq('http://error.com'), Error('network error'))
```

Recall that `async` functions always return promises. So we converted our previously callback-based faux-request API to an `async` function. We can then use `assert.reject` and `assert.doesNotReject` to test the success case and the error case. One caveat with these assertions is that they also return promises, so in the case of an assertion error a promise will reject with an `AssertionError` rather than `AssertionError` being thrown as an exception.

## Jest

A test framework environment may provide a module or modules, but it will also introduce implicit globals into the environment and requires another CLI tool to execute tests so that these implicit globals can be injected. For an example of a test framework environment we'll be looking at `jest`.