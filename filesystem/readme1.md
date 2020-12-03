## File System Management

### File Paths
Management of the file system is really achieved with teo core modules `fs` and `path`. The `path` module is important for path manipulation and normalization across platforms and the `fs` module provides APIs to deal with the business of reading, writing, file system meta-data and file system watching.

Before locating a relative file path, we often need to know where the particular file being executed is located. For this there are two variables that are always present in every module: `__filename` and `__dirname`.

The __filename variable holds the absolute path to the currently executing file, and the __dirname variable holds the absolute path to the directory that the currently executing file is in:

```sh
'use strict'
console.log('current filename', __filename)
console.log('current dirname', __dirname)
```

```sh
current filename /Users/jhormaza/Documents/projects/node-work/jsnad-labs/filesystem/index.js
current dirname /Users/jhormaza/Documents/projects/node-work/jsnad-labs/filesystem
```

Probably the most commonly used method of the path module is the `join` method. Windows systems use different path separators to POSIX systems (such as Linux and macOS)

Let's say we want to create a cross-platform path to a file named out.txt that is in the same folder as the file currently being executed. This can be achieved like so:

```sh
'use strict'
const { join } = require('path')
console.log('out file:', join(__dirname, 'out.txt'))
```

### File Paths

The `path.join` method can be passed as many arguments as desired, for instance `path.join('foo', 'bar', 'baz')` will create the string `'foo/bar/baz'` or `'foo\\bar\\baz'` depending on platform.

Apart from `path.isAbsolute` which as the name suggests will return `true` if a given path is absolute, the available path methods can be broadly divided into path builders and path deconstructors.

Alongside `path.join` the other path builders are:

- `path.relative`
Given two absolute paths, calculates the relative path between them.

- `path.resolve`
Accepts multiple string arguments representing paths. Conceptually each path represents navigation to that path. The `path.resolve` function returns a string of the path that would result from navigating to each of the directories in order using the command line `cd` command. For instance `path.resolve('/foo', 'bar', 'baz')` would return `'/foo/bar/baz'`, which is akin to executing `cd` /foo then cd bar then cd baz on the command line, and then finding out what the current working directory is.

- `path.normalize`
Resolves .. and . dot in paths and strips extra slashes, for instance `path.normalize('/foo/../bar//baz')` would return `'/bar/baz'`.

- `path.format`
Builds a string from an object. The object shape that `path.format` accepts, corresponds to the object returned from `path.parse` which we'll explore next.

The path deconstructors are `path.parse`, `path.extname`, `path.dirname` and `path.basename`. Let's explore these with a code example:

```sh
'use strict'
const { parse, basename, dirname, extname } = require('path')
console.log('filename parsed:', parse(__filename))
console.log('filename basename:', basename(__filename))
console.log('filename dirname:', dirname(__filename))
console.log('filename extname:', extname(__filename))
```

### Reading and Writing

The `fs.promises` API provides most of the same asynchronous methods that are available on `fs`, but the methods return promises instead of accepting callbacks.

Callback example:
```sh
'use strict'

const { join } = require('path')
const { readFile, writeFile } = require('fs')

readFile(__filename, {encoding: 'utf8'}, (err, contents) => {
  if (err) {
    console.error('somenthing bad happened in read', err)
  }
  const toUpper = contents.toUpperCase();
  const out = join(__dirname, 'out.txt')
  writeFile('out.txt', toUpper, (err)=>{
    if (err) { console.error(err) }
  })
})

```

So instead of loading `readFile` and `writeFile` like so:

```sh
const { readFile, writeFile } = require('fs').promises
```

Reading and writing example using `fs.promises` and using async/await to resolve the promises:

```sh
'use strict'

const { join } = require('path')
const { writeFile, readFile } = require('fs').promises

async function run() {
  const contents = await readFile(__filename, { encoding: 'utf8' })
  const out = join(__dirname, 'out.txt')
  await writeFile(out, contents.toUpperCase())
}

run().catch(console.error)
```


### File Streams

This pattern is excellent if dealing with a large file because the memory usage will stay constant as the file is read in small chunks and written in small chunks.

```sh
'use strict'
const { pipeline } = require('stream')
const { join } = require('path')
const { createReadStream, createWriteStream } = require('fs')
const { Transform } = require('stream')
const createUppercaseStream = Transform({
    transform: (chunk, enc, next) => {
      const uppercased = chunk.toString().toUpperCase()
      next(null, uppercased)
    }
})

pipeline(
  createReadStream(__filename),
  createUppercaseStream,
  createWriteStream(join(__dirname, 'out.txt')),
  (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('finished writing')
  }
)
```

### Reading Directories

Directories are a special type of file, which hold a catalog of files. Similar to files the fs module provides multiple ways to read a directory:

- Synchronous
- Callback-based
- Promise-based
- An async iterable that inherits from fs.Dir

The `example.js` file would be the file that executes our code. Let's look at synchronous, callback-based and promise-based at the same time:


```sh
'use strict'
const { readdirSync, readdir } = require('fs')
const { readdir: readdirProm } = require('fs').promises

try {
  console.log('sync', readdirSync(__dirname))
} catch (err) {
  console.error(err)
}

readdir(__dirname, (err, files) => {
  if (err) {
    console.error(err)
    return
  }
  console.log('callback', files)
})

async function run () {
  const files = await readdirProm(__dirname)
  console.log('promise', files)
}

run().catch((err) => {
  console.error(err)
})
```

### File Metadata

Metadata about files can be obtained with the following methods:

- fs.stat, fs.statSync, fs.promises.stat
- fs.lstat, fs.lstatSync, fs.promises.lstat

The only difference between the `stat` and `lstat` methods is that `stat` follows symbolic links, and `lstat` will get meta data for symbolic links instead of following them.

Let's start by reading the current working directory and finding out whether each entry is a directory or not.

```sh
'use strict'
const { readdirSync, statSync } = require('fs')

const files = readdirSync('.')

for (const name of files) {
  const stat = statSync(name)
  const typeLabel = stat.isDirectory() ? 'dir: ' : 'file: '
  console.log(typeLabel, name)
}
```

Since '.' is passed to readdirSync, the directory that will be ready will be whatever directory we're currently in.

Let's extend our example with time `stats`. There are four `stats` available for files:

- Access time
- Change time
- Modified time
- Birth time

Let's update our code to output the four different time stats for each file:

```sh
'use strict'
const { readdirSync, statSync } = require('fs')

const files = readdirSync('.')

for (const name of files) {
  const stat = statSync(name)
  const typeLabel = stat.isDirectory() ? 'dir: ' : 'file: '
  const { atime, birthtime, ctime, mtime } = stat
  console.group(typeLabel, name)
  console.log('atime:', atime.toLocaleString())
  console.log('ctime:', ctime.toLocaleString())
  console.log('mtime:', mtime.toLocaleString())
  console.log('birthtime:', birthtime.toLocaleString())
  console.groupEnd()
  console.log()
}
```

### Watching

The `fs.watch` method is provided by Node core to tap into file system events. It is however, fairly low level and not the most friendly of APIs. Now, we will explore the core fs.watch method. However, it's worth considering the ecosystem library, `chokidar` for file watching needs as it provides a friendlier high level API.

Let's start by writing watching the current directory and logging file names and events:

```sh
'use strict'

const {watch} = require('fs')

watch('.', (evt, filename) => {
  console.log(evt, filename)
})
```
