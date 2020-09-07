### Creating a Module

The result of `require` won't always be a function that when called generates an instance, as in the case of `Pino`. The `require` function will return whatever is exported from a module.

Let's create a file called `format.js` in the `my-package`:

```sh
'use strict'

const upper = (str) => {
  if (typeof str === 'symbol') str = str.toString()
  str += ''
  return str.toUpperCase()
}

module.exports = { upper: upper }
```

We created a function called `upper` which will convert any input to a string and convert that string to an upper-cased string. Whatever is assigned to `module.exports` will be the value that is returned when the module is required. The require function returns `module.exports` of the module that it is loading. In this case, `module.exports` is assigned to an object, with an upper key on it that references the upper function.

The `format.js` file can now be loaded into our `index.js` file as a local module. Modify `index.js` to the following:

```sh
'use strict'
const pino = require('pino')
const format = require('./format')
const logger = pino()
logger.info(format.upper('my-package started'))
process.stdin.resume()
```

The `format.js` file is loaded into the `index.js` file by passing a path into `require`. The extension (`.js`) is allowed but not necessary. So `require('./format')` will return the `module.exports` value in `format.js`, which is an object that has an upper method. The `format.upper` method is called within the call to logger.info which results in an upper-cased string "MY-PACKAGE STARTED" being passed to `logger.info`.

### Detecting Main Module


