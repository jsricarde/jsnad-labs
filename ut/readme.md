## Assertions

An assertion checks a value for a given condition and throws if that condition is not met. Assertions are the fundamental building block of unit and integration testing. The core `assert` module exports a function that will throw an `AssertionError` when the value passed to it is false (meaning that the value can be coerced to `false` with `!!val`):

<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/ut/imgs/ut-1.png" width="1000" />
  <br />
</p>

If the value passed to assert is truthy then it will not throw. This is the key behavior of any assertion, if the condition is met the assertion will throw an error. The error throw is an instance of AssertionError (to learn more see Class: assert.AssertionError).

The core assert module has the following assertion methods:

- `assert.ok(val) – the same as assert(val)`
- `assert.equal(val1, val2) – coercive equal, val1 == val2`
- `assert.notEqual(val1, val2) – coercive unequal, val1 != val2`
- `assert.strictEqual(val1, val2) – strict equal, val1 === val2`
- `assert.notStrictEqual(val1, val2) – strict unequal, val1 !== val2`
- `assert.deepEqual(obj1, obj2) – coercive equal for all values in an object`
- `assert.notDeepEqual(obj1, obj2) – coercive unequal for all values in an object`
- `assert.deepStrictEqual(obj1, obj2) – strict equal for all values in an object`
- `assert.notDeepStrictEqual(val1, val2) – strict unequal for all values in an object`
- `assert.throws(function) – assert that a function throws`
- `assert.doesNotThrow(function) – assert that a function doesn't throw`
- `assert.rejects(promise|async function) – assert promise or returned promise rejects`
- `assert.doesNotReject(promise|async function) – assert promise or returned promise resolves`
- `assert.ifError(err) – check that an error object is falsy`
- `assert.match(string, regex) – test a string against a regular expression`
- `assert.doesNotMatch(string, regex) – test that a string fails a regular expression`
- `assert.fail() – force an AssertionError to be thrown`

Since the Node core assert module does not output anything for success cases there is no `assert.pass` method as it would be behaviorally the same as doing nothing

We can group the assertions into the following categories:

- Truthiness (assert and assert.ok)
- Equality (strict and loose) and Pattern Matching (match)
- Deep equality (strict and loose)
- Errors (ifError plus throws, rejects and their antitheses)
- Unreachability (fail)

There are third party libraries that provide alternative APIs and more assertions, which we will explore briefly at the end of this section. However this set of assertions (not the API itself but the actual assertion functionality provided) tends to be everything we need to write good tests. In fact, the more esoteric the assertion the less useful it is long term. This is because assertions provide a common language of expectations among developers. So inventing or using more complex assertion abstractions that combine basic level assertions reduces the communicability of test code among a team of developers.

Generally when we check a value, we also want to check its type. Let's imagine we're testing a function named add that takes two numbers and adds them together. We can check that add(2, 2) is 4 with:

```sh
const assert = require('assert')
const add = require('./get-add-from-somewhere.js')
assert.equal(add(2,2), 4)
```

This will pass both if add returns 4, but it will also pass if add returns '4' (as a string). It will even pass if add returns an object with the form { valueOf: () => 4 }. This is because assert.equal is coercive, meaning it will convert whatever the output of add is to the type of the expected value. In this scenario, it probably makes more sense if add only ever returns numbers. One way to address this is to add a type check like so:

```sh
const assert = require('assert')
const add = require('./get-add-from-somewhere.js')
const result = add(2, 2)
assert.equal(typeof result, 'number')
assert.equal(result, 4)
```

In this case if add doesn't return the number 4, the typeof check will throw an `AssertionError`.

The other way to handle this is to use `assert.strictEqual`:

```sh
const assert = require('assert')
const add = require('./get-add-from-somewhere.js')
assert.strictEqual(add(2, 2), 4)
```

Since `assert.strictEqual` checks both value and type, using the triple equals operator `(===)` if add does not return 4 as a number an `AssertionError` will be thrown.

The `assert` module also exposes a `strict` object where namespaces for `non-strict` methods are `strict`, so the above code could also be written as:

```sh
const assert = require('assert')
const add = require('./get-add-from-somewhere.js')
assert.strict.equal(add(2, 2), 4)
```

It's worth noting that `assert.equal` and other non-strict (i.e. coercive) assertion methods are deprecated, which means they may one day be removed from Node core. Therefore if using the Node core assert module, best practice would be always to use `assert.strict` rather than assert, or at least always use the strict methods (e.g. `assert.strictEqual`).

There are assertion libraries in the ecosystem which introduce alternative APIs but at a fundamental level, work in the same way. That is, an assertion error will be thrown if a defined condition is not met.

Let's take a look at an equivalent example using the fluid API provided by the expect library.

```sh
const expect = require('expect')
const add = require('./get-add-from-somewhere.js')

expect(add(2, 2)).toStrictEqual(4)
```

With the expect assertion library, the value that we are asserting against is passed to the expect function, which returns an object with assertion methods that we can call to validate that value. In this case, we call toStrictEqual to apply a strict equality check. For a coercive equality check we could use expect(add(2, 2).toBe(4).

If an assertion fails, the expect library will throw a JestAssertionError, which contains extra information and prettier output than the core AssertionError instances:

<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/ut/imgs/ut-1.png" width="1000" />
  <br />
</p>

The expect library is part of the Jest test runner framework, which we'll explore in more depth later in this section. For now, we'll continue to discuss Node's assert module, but it's useful to point out that the core concepts are the same across all commonly used assertion libraries.

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

The difference between assert.deepEqual and assert.deepStrictEqual (and assert.strict.deepEqual) is that the equality checks of primitive values (in this case the id property value and the name.first and name.second strings) are coercive, which means the following will also pass:

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

The error handling assertions (throws, ifError, rejects) are useful for asserting that error situations occur for synchronous, callback-based and promise-based APIs.

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

Notice that the invocation of add is wrapped inside another function. This is because the assert.throws and assert.doesNotThrow methods have to be passed a function, which they can then wrap and call to see if a throw occurs or not. When executed the above code will pass, which is to say, no output will occur and the process will exit.

For callback-based APIs, the assert.ifError will only pass if the value passed to it is either null or undefined. Typically the err param is passed to it, to ensure no errors occurred:

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

We create a function called pseudoReq which is a very approximated emulation of a URL fetching API. The first time we call it with a string and a callback function we pass the err parameter to assert.ifError. Since err is null in this scenario, assert.ifError does not throw an AssertionError. The second time we call pseudoReq we trigger an error. To test an error case with a callback API we can check the err param against the expected error object using assert.deepStrictEqual.

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

Recall that async functions always return promises. So we converted our previously callback-based faux-request API to an async function. We can then use assert.reject and assert.doesNotReject to test the success case and the error case. One caveat with these assertions is that they also return promises, so in the case of an assertion error a promise will reject with an AssertionError rather than AssertionError being thrown as an exception.

Notice that in all three cases we didn't actually check output. In the next section, we'll use different test runners, with their own assertion APIs to fully test the APIs we defined here.

## Test Harnesses

While assertions on their own are a powerful tool, if one of the asserted values fails to meet a condition an AssertionError is thrown, which causes the process to crash. This means the results of any assertions after that point are unknown, but any additional assertion failures might be important information.

It would be great if we could group assertions together so that if one in a group fails, the failure is output to the terminal but the remaining groups of assertions still run.

This is what test harnesses do. Broadly speaking we can group test harnesses into two categories: pure libraries vs framework environments.


### Pure Library

Pure library test harnesses provide a module, which is loaded into a file and then used to group tests together. As we will see, pure libraries can be executed directly with Node like any other code. This has the benefit of easier debuggability and a shallower learning curve. We'll be looking at tap.

### Framework Environment

A test framework environment may provide a module or modules, but it will also introduce implicit globals into the environment and requires another CLI tool to execute tests so that these implicit globals can be injected. For an example of a test framework environment we'll be looking at jest.

