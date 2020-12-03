## File Paths

Management of the file system is really achieved with two core modules, `fs` and `path`. The path module is important for path manipulation and normalization across platforms and the `fs` module provides APIs to deal with the business of reading, writing, file system meta-data and file system watching.

Before locating a relative file path, we often need to know where the particular file being executed is located. For this there are two variables that are always present in every module: `__filename` and `__dirname`.

The `__filename` variable holds the absolute path to the currently executing file, and the `__dirname` variable holds the absolute path to the directory that the currently executing file is in.

Let's say we have an `example.js` file at `/training/ch-13/example.js`, and the following is the content of the `example.js` file:

```sh
'use strict'
console.log('current filename', __filename)
console.log('current dirname', __dirname)
```

This would output the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-1.png" width="1000" />
  <br />
</p>

Even if we run the `example.js` file from a different working directory, the output will be the same:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-2.png" width="1000" />
  <br />
</p>

Probably the most commonly used method of the `path` module is the `join` method. Windows systems use different path separators to POSIX systems (such as Linux and macOS). For instance a path on Linux or macOS could be `/training/ch-13/example.js` whereas on Windows it would be (assuming the path was on drive C), `C:\training\ch-13\example.js.` To make matters worse, backslash is the escape character in JavaScript strings so to represent a Windows `path` in a string the path would need to be written as `C:\\training\\ch-13\\example.js.` The `path.join` method side-steps these issues by generating a `path` that's suitable for the platform.

Let's say we want to create a cross-platform path to a file named `out.txt` that is in the same folder as the file currently being executed. This can be achieved like so:

```sh
'use strict'
const { join } = require('path')
console.log('out file:', join(__dirname, 'out.txt'))
```

Given this code ran in an `example.js` file located in `/training/ch-13` this will print out file: `/training/ch-13/out.txt` on macOS and Linux systems:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-3.png" width="1000" />
  <br />
</p>

On a Windows system, assuming the `example.js` file is located in `C:\\training\\ch-13` this will output out file: `c:\\training\ch-13\out.txt` on Windows systems.

The `path.join` method can be passed as many arguments as desired, for instance `path.join('foo', 'bar', 'baz')` will create the string `'foo/bar/baz'` or `'foo\\bar\\baz'` depending on platform.

Apart from `path.isAbsolute` which as the name suggests will return true if a given path is absolute, the available path methods can be broadly divided into path builders and path deconstructors.

- `path.relative`: Given two absolute paths, calculates the relative path between them.
- `path.resolve`: Accepts multiple string arguments representing paths. Conceptually each path represents navigation to that path. The path.resolve function returns a string of the path that would result from navigating to each of the directories in order using the command line cd command. For instance path.resolve('/foo', 'bar', 'baz') would return '/foo/bar/baz', which is akin to executing cd /foo then cd bar then cd baz on the command line, and then finding out what the current working directory is.
- `path.normalize`: Resolves .. and . dot in paths and strips extra slashes, for instance path.normalize('/foo/../bar//baz') would return '/bar/baz'.
- `path.format`: Builds a string from an object. The object shape that path.format accepts, corresponds to the object returned from path.parse which we'll explore next.

The path deconstructors are `path.parse`, `path.extname`, `path.dirname` and `path.basename`. Let's explore these with a code example:


<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-4.png" width="1000" />
  <br />
</p>

On Windows the output would be similar except the root property of the parsed object would contain the drive letter, e.g. `'C:\\'` and both the `dir` property and the result of the `dirname` method would return paths with a drive letter and backslashes instead of forward slashes.

The `parse` method returns an object with `root`, `dir`, `base`, `ext`, and `name` properties. The `root` and name values can only be ascertained with the path module by using the `parse` method. The `base`, `dir` and `ext` properties can be individually calculated with the `path.dirname` and `path.basename` methods respectively.

This section has provided an overview with focus on common usage. Refer to the Node core path Documentation to learn more.

## Reading and Writing

The `fs` module has lower level and higher level APIs. The lower level API's closely mirror POSIX system calls. For instance, fs.open opens and possibly creates a file and provides a file descriptor handle, taking same options as the POSIX open command (see open(3) - Linux man page by linux.die.net and fs.open(path[, flags[, mode]], callback) section of the Node.js Documentation for more details). While we won't be covering the lower level APIs as these are rarely used in application code, the higher level API's are built on top of them.

The higher level methods for reading and writing are provided in four abstraction types:

- `Synchronous`
- `Callback based`
- `Streams based`
- `Promises based`

We'll first explore synchronous, callback-based and promised-based APIs for reading and writing files. Then we'll cover the filesystem streaming APIs.

All the names of synchronous methods in the fs module end with Sync. For instance, fs.readFileSync. Synchronous methods will block anything else from happening in the process until they have resolved. These are convenient for loading data when a program starts, but should mostly be avoided after that. If a synchronous method stops anything else from happening, it means the process can't handle or make requests or do any kind of I/O until the synchronous operation has completed.

Let's take a look at an example:


```sh
'use strict'
const { readFileSync } = require('fs')
const contents = readFileSync(__filename)
console.log(contents)
```

The above code will synchronously read its own contents into a buffer and then print the buffer:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-5.png" width="1000" />
  <br />
</p>

The encoding can be set in an options object to cause the `fs.readFileSync` function to return a string:

```sh
'use strict'
const { readFileSync } = require('fs')
const contents = readFileSync(__filename, { encoding: 'utf8' })
console.log(contents)
```
This will result in the file printing its own code:

The fs.writeFileSync function takes a path and a string or buffer and blocks the process until the file has been completely written:

```sh
'use strict'
const { readFileSync, writeFileSync } = require('fs')
const contents = readFileSync(__filename, { encoding: 'utf8' })
console.log(contents)
writeFileSync(join(__dirname, 'out.txt'), contents.toUpperCase())
```

In this example, instead of logging the contents out, we've upper cased the contents and written it to an `out.txt` file in the same directory:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-7.png" width="1000" />
  <br />
</p>

An options object can be added, with a `flag` option set to 'a' to open a file in append mode:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-8.png" width="1000" />
  <br />
</p>

For a full list of supports flags, see File System Flags section of the Node.js Documentation. 

If there's a problem with an operation the *Sync APIs will throw. So to perform error handling they need to be wrapped in a `try/catch`:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-9.png" width="1000" />
  <br />
</p>

To create this error the fs.chmodSync method was used. It generated a permission denied error when the fs.writeFileSync method attempted to access it. This triggered the catch block with the error where it was logged out with console.error. The permissions were then restored at the end using fs.chmodSync again. For more on fs.chmodSync see Node.js Documentation.

In the case of the *Sync, APIs control flow is very simple because execution is sequential, the chronological ordering maps directly with the order of instructions in the file. However, Node works best when I/O is managed in the background until it is ready to be processed. For this, there's the callback and promise based filesystem APIs. The asynchronous control flow was discussed at length in Section 8 - "Asynchronous Control Flow", the choice on which abstraction to use depends heavily on project context. So let's explore both, starting with callback-based reading and writing.

The fs.readFile equivalent, with error handling, of the fs.readFileSync with encoding set to UTF8 example is:

```sh
'use strict'
const { readFile } = require('fs')
readFile(__filename, {encoding: 'utf8'}, (err, contents) => {
  if (err) {
    console.error(err)
    return
  }
})
```

When the process is executed this achieves the same objective, it will print the file contents to the terminal:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-10.png" width="1000" />
  <br />
</p>

However, the actual behavior of the I/O operation and the JavaScript engine is different. In the readFileSync case execution is paused until the file has been read, whereas in this example execution is free to continue while the read operation is performed. Once the read operation is completed, then the callback function that we passed as the third argument to readFile is called with the result. This allows for the process to perform other tasks (accepting an HTTP request for instance).

Let's asynchronously write the upper-cased content to out.txt as well:

```sh
'use strict'

const { readFile, writeFile } = require('fs')
const { join } = require('path')

readFile(join(__dirname, 'out.txt'), (err, data) => {
    if (err) {
        console.error(err)
        return
    } else {
        writeFile(join(__dirname, 'out-2.txt'), data, (err) => {
            if (err) {
                console.error(err)
                return
            }

        })
    }
})
```

If the above executed is examined and the out.txt is examined it will contain the above code, but upper-cased:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-11.png" width="1000" />
  <br />
</p>

As discussed in Section 8 - "Asynchronous Control Flow", promises are an asynchronous abstraction like callbacks but can be used with async/await function to provide the best of both worlds: easy to read sequential instructions plus non-blocking execution.

The fs.promises API provides most of the same asynchronous methods that are available on fs, but the methods return promises instead of accepting callbacks.

So instead of loading readFile and `writeFile` like so:

```sh
'use strict'

const { join } = require('path')
const { readFile, writeFile } = require('fs').promises

async function run(params) {
    const contents = await readFile(__filename, {encoding: 'utf8'})
    const out = join(__dirname, 'out-3.txt')
    const write = await writeFile(out, contents)
}

run().catch(console.error)
```

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-12.png" width="1000" />
  <br />
</p>

## File Streams

Recall from the previous section that the fs module has four API types:

- `Synchronous`
- `Callback-based`
- `Promise-based`
- `Stream-based`

The fs module has fs.createReadStream and fs.createWriteStream methods which allow us to read and write files in chunks. Streams are ideal when handling very large files that can be processed incrementally.

Let's start with by simply copying the file:

```sh
'use strict'
const { pipeline } = require('stream')
const { join } = require('path')
const { createReadStream, createWriteStream } = require('fs')

pipeline(
  createReadStream(__filename),
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

This pattern is excellent if dealing with a large file because the memory usage will stay constant as the file is read in small chunks and written in small chunks.

To reproduce the read, uppercase, write scenario we created in the previous section, we will need a transform stream to uppercase the content:

```sh
'use strict'
const { pipeline } = require('stream')
const { join } = require('path')
const { createReadStream, createWriteStream } = require('fs')
const { Transform } = require('stream')
const createUppercaseStream = () => {
  return new Transform({
    transform (chunk, enc, next) {
      const uppercased = chunk.toString().toUpperCase()
      next(null, uppercased)
    }
  })
}

pipeline(
  createReadStream(__filename),
  createUppercaseStream(),
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

Our pipeline now reads chunks from the file read stream, sends them through our transform stream where they are upper-cased and then sent on to the write stream to achieve the same result of upper-casing the content and writing it to out.txt:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-13.png" width="1000" />
  <br />
</p>

## Reading Directories

Directories are a special type of file, which hold a catalog of files. Similar to files the fs module provides multiple ways to read a directory:

- `Synchronous`
- `Callback-based`
- `Promise-based`
- An async iterable that inherits from `fs.Dir`