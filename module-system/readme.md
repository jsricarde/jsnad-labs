## Loading Module

By the end of Section 6 - "Packages & Dependencies" we had a my-package folder, with a `package.json` file and an `index.js` file.

The `package.json` file is as follows:

```sh
{
  "name": "my-package",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1",
    "lint": "standard"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "pino": "^6.2.1"
  },
  "devDependencies": {
    "standard": "^14.3.3"
  }
}
```

The `index.js` file has the following content:

```sh
'use strict'
console.log('my-package started')
process.stdin.resume()
```

On the command line, with the my-package folder as the current working directory run the install command:

```sh
npm install
```

As long as Pino is installed, the module that the Pino package exports can be loaded.

Let's replace the `console.log` statement in our `index.js` file with a logger that we instantiate from the Pino module:.

Modify the `index.js` file to the following:

```sh
'use strict'
const pino = require('pino')
const logger = pino()
logger.info('my-package started')
process.stdin.resume()
```

Now the Pino module has been loaded using require. The require function is passed a package's namespace, looks for a directory with that name in the node_modules folder and returns the exported value from the main file of that package.

When we require the Pino module we assign the value returned from require to the constant: pino.

In this case the Pino module exports a function, so pino references a function that creates a logger.

We assign the result of calling pino() to the logger reference. Then logger.info is called to generate a log message.

Now if we run npm start we should see a JSON formatted log message:

<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/module-system/imgs/module-1.png" width="1000" />
  <br />
</p>

## Creating a Module

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

Now we have both a package module (pino) and a local module (format.js) loaded and used in the `index.js` file.

We can see this in action by running npm `start`:

<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/module-system/imgs/module-2.png" width="1000" />
  <br />
</p>

## Detecting Main Module

The "start" script in the `package.json` file executes node `index.js`. When a file is called with node that file is the entry point of a program. So currently `my-package` is behaving more like an application or service than a package module.

In some situations we may want a module to be able to operate both as a program and as a module that can be loaded into other modules.

When a file is the entry point of a program, it's the main module. We can detect whether a particular file is the main module in two ways.

We can check if `module.parent` is null or we can check if `require.main` is the module object.

We'll use the second approach here, let's modify the `index.js` file to the following:

```sh
'use strict'
const format = require('./format')

if (require.main === module) {
  const pino = require('pino')
  const logger = pino()
  logger.info(format.upper('my-package started'))
  process.stdin.resume()
} else {
  const reverseAndUpper = (str) => {
    return format.upper(str).split('').reverse().join('')
  }
  module.exports = reverseAndUpper
}
```

Now the `index.js` file has two operational modes.

If it is loaded as a module, it will export a function that reverses and upper-cases a string:

<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/module-system/imgs/module-3.png" width="1000" />
  <br />
</p>

But if it's executed with node, it will exhibit the original behavior:

<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/module-system/imgs/module-4.png" width="1000" />
  <br />
</p>

### Resolving a Module Path
The `require` function has a method called `require.resolve`. This can be used to determine the absolute path for any required module.

Let's create a file in `my-package` and call it `resolve-demo.js`, and place the following code into it:

```sh
'use strict'

console.log()
console.group('# package resolution')
console.log(`require('pino')`, '\t', ' =>', require.resolve('pino'))
console.log(`require('standard')`, '\t', ' =>', require.resolve('standard'))
console.groupEnd('')
console.log()

console.group('# directory resolution')
console.log(`require('.')`, '\t\t', ' =>', require.resolve('.'))
console.log(`require('../my-package')`, '=>', require.resolve('../my-package'))
console.groupEnd()
console.log()

console.group('# file resolution')
console.log(`require('./format')`, '\t', ' =>', require.resolve('./format'))
console.log(`require('./format.js')`, ' =>', require.resolve('./format'))
console.groupEnd()
console.log()

console.group('# core APIs resolution')
console.log(`require('fs')`, '\t', ' =>', require.resolve('fs'))
console.log(`require('util')`, '\t', ' =>', require.resolve('util'))
console.groupEnd()
console.log()
```

If we run execute resolve-demo.js with node we'll see the resolved path for each of the require examples:

<p align="center">
<img src="https://github.com/jsricarde/jsnad-labs/raw/master/module-system/imgs/module-5.png" width="1000" />
  <br />
</p>