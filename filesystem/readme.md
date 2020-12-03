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

While it will be explored here, going into depth on the last bullet point is beyond the scope of this chapter, but see Class `fs.Dir` of the Node.js Documentation for more information.

The pros and cons of each API approach is the same as reading and writing files. Synchronous execution is recommended against when asynchronous operations are relied upon (such as when serving HTTP requests). Callback or promise-based are best for most cases. The stream-like API would be best for extremely large directories.

Let's say we have a folder with the following files:

- `example.js`
- `file-a`
- `file-b`
- `file-c`

The `example.js` file would be the file that executes our code. Let's look at synchronous, callback-based and promise-based at the same time:

```sh
'use strict'

const { readdir, readdirSync } = require('fs')
const {readdir: readDirProm } = require('fs').promises
const { join } = require('path')

const out = join(__dirname, 'directories')

try {
    const directories = readdirSync(out)
    console.log('sync: ', directories);  
} catch (err) {
    console.error(err)
}

async function run() {
    const directories = await readDirProm(out)
    console.log('async: ', directories);
}

readdir(out, (err, directories) => {
    if (err) {
        console.error(err)
        return
    } else {
        console.log('callback: ', directories);
    }
})

run().catch(console.error)
```

When executed our example code outputs the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-14.png" width="1000" />
  <br />
</p>

The first section of code executes readdirSync(__dirname), this pauses execution until the directory has been read and then returns an array of filenames. This is passed into the console.log function and so written to the terminal. Since it's a synchronous method, it may throw if there's any problem reading the directory, so the method call is wrapped in a try/catch to handle the error.

The second section used the readdir callback method, once the directory has been read the second argument (our callback function) will be called with the second argument being an array of files in the provided directory (in each example we've used __dirname, the current directory). In the case of an error the first argument of our callback function will be an error object, so we check for it and handle it, returning early from the function. In the success case, the files are logged out with console.log.

We aliased fs.promises.readdir to readdirProm to avoid namespace collision. In the third section the readdirProm(__dirname) invocation returns a promise which is awaited in the async run function. The directory is asynchronously read, so execution won't be blocked. However because run is an async function the function itself will pause until the awaited promise returned by readdirProm function resolves with the array of files (or rejects due to error). This resolved value is stored in the files array and then passed to console.log. If readdirProm does reject, the promise automatically returned from the run function will likewise reject. This is why when run is called a catch handler is attached to the result where the error can be handled.

For extremely large directories they can also be read as a stream using fs.opendir, fs.opendirSync or fs.promises.opendir method which provides a stream-like interface that we can pass to Readable.from to turn it into a stream (we covered Readable.from in the previous section - "Working with Streams").

This course does not attempt to cover HTTP, for that see the sibling course, Node.js Services Development (LFW212) - coming soon. However, for the final part of this section we'll examine a more advanced case: streaming directory contents over HTTP in JSON format:

```sh
'use strict'
const { createServer } = require('http')
const { Readable, Transform, pipeline } = require('stream')
const { opendirSync } = require('fs')

const createEntryStream = () => {
  let syntax = '[\n'
  return new Transform({
    writableObjectMode: true,
    readableObjectMode: false,
    transform (entry, enc, next) {
      next(null, `${syntax} "${entry.name}"`)
      syntax = ',\n'
    },
    final (cb) {
      this.push('\n]\n')
      cb()
    }
  })
}

createServer((req, res) => {
  if (req.url !== '/') {
    res.statusCode = 404
    res.end('Not Found')
    return
  }
  const dirStream = Readable.from(opendirSync(__dirname))
  const entryStream = createEntryStream()
  res.setHeader('Content-Type', 'application/json')
  pipeline(dirStream, entryStream, res, (err) => {
    if (err) console.error(err)
  })
}).listen(3000)
```

The above example will respond to an HTTP request to http://localhost:3000 with a JSON array of files. In the following screenshot the server is started in the lower terminal and then an HTTP request is made with Node:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-15.png" width="1000" />
  <br />
</p>

The fs.opendirSync method returns an instance of fs.Dir which is not a stream, but it is an async iterable (see for await...of and Symbol.asyncIterator sections of MDN web docs). The stream.Readable.from method can be passed an async iterable to convert it to a stream. Inside the function passed to createServer we do just that and assign it to dirStream. We also create an entryStream which is a transform stream that we've implemented in our createEntryStream function. The res object represents the HTTP response and is a writable stream. We set up a pipeline from dirStream to entryStream to res, passing a final callback to pipeline to log out any errors.

Some more advanced options are passed to the Transform stream constructor, writableObjectMode and readableObjectMode allow for the objectMode to be set for the read and write interfaces separately. The writableObjectMode is set to true because dirStream is an object stream (of fs.Dirent objects, see Class: fs.Dirent section of Node.js Documentation). The readableObjectMode is set to false because res is a binary stream. So our entryStream can be piped to from an object stream, but can pipe to a binary stream.

The writable side of the transform stream accepts objects, and dirStream emits objects which contain a name property. Inside the transform function option, a string is passed as the second argument to next, which is composed of the syntax variable and entry.name. For the first entry that is written to the transform stream, the syntax variable is '[\n' which opens up the JSON array. The syntax variable is then set to ',\n' which provides a delimiter between each entry.

The final option function is called before the stream ends, which allows for any cleanup or final data to send through the stream. In the final function this.push is called in order to push some final bytes to the readable side of the transform stream, this allows us to close the JSON array. When we're done we call the callback (cb) to let the stream know we've finished any final processing in the final function.

## File Metadata

Metadata about files can be obtained with the following methods:

- `fs.stat, fs.statSync, fs.promises.stat`
- `fs.lstat, fs.lstatSync, fs.promises.lstat`

These methods return an fs.Stat instance which has a variety of properties and methods for looking up metadata about a file, see Class: fs.Stats section of the Node.js Documentation for the full API.

We'll now look at detecting whether a given path points to a file or a directory and we'll look at the different time stats that are available.

By now, we should understand the difference and trade-offs between the sync and async APIs so for these examples we'll use `fs.statSync`.

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

Since '.' is passed to `readdirSync`, the directory that will be ready will be whatever directory we're currently in.

Given a directory structure with the following:

- `example.js`
- `a-dir`
- `a-file`

Where `example.js` is the file with our code in, if we run node example.js in that folder, we'll see something like the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-16.png" width="1000" />
  <br />
</p>

Let's extend our example with time stats. There are four stats available for files:

- Access time
- Change time
- Modified time
- Birth time

The difference between change time and modified time, is modified time only applies to writes (although it can be manipulated by fs.utime), whereas change time applies to writes and any status changes such as changing permissions or ownership.

With default options, the time stats are offered in two formats, one is a Date object and the other is milliseconds since the epoch. We'll use the Date objects and convert them to locale strings.

Let's update our code to output the four different time stats for each file:

```sh
'use strict'

const { readdirSync, statSync } = require('fs')

const files = readdirSync('.')

for (const name of files) {
    const stat = statSync(name)
    const typeLabel = stat.isDirectory() ? 'dir' : 'file'
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

This will output something like the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-17.png" width="1000" />
  <br />
</p>

## Watching

The `fs.watch` method is provided by Node core to tap into file system events. It is however, fairly low level and not the most friendly of APIs. Now, we will explore the core `fs.watch` method. However, it's worth considering the ecosystem library, `chokidar` for file watching needs as it provides a friendlier high level API.

Let's start by writing watching the current directory and logging file names and events:

```sh
'use strict'

const { watch } = require('fs')

watch('.', (evt, filename) => {
    console.log(evt, filename)
})
```

The above code will keep the process open and watch the directory of wherever the code is executed from. Any time there's a change in the directory the listener function passed as the second argument to watch will be called with an event name (evt) and the filename related to the event.

The following screenshot shows the above code running in the top terminal, and file manipulation commands in the bottom section.

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-18.png" width="1000" />
  <br />
</p>

The output in the top section is output in real time for each command in the bottom section. Let's analyze the commands in the bottom section to the output in the top section:

- Creating a new file named `test` (node -e "fs.writeFileSync('test', 'test')") generates an event called rename.
- Creating a folder called `test-dir` (node -e "fs.mkdirSync('test-dir')") generates an event called rename.
- Setting the permissions of `test-dir` (node -e "fs.chmodSync('test-dir', 0o644)") generates an event called rename.
- Writing the same content to the `test` file (node -e "fs.writeFileSync('test', 'test')") generates an event named change.
- Setting the permissions of `test-dir` (node -e "fs.chmodSync('test-dir', 0o644)") a second time generates a change event this time.
Deleting the test file (node -e "fs.unlinkSync('test')") generates a rename event.

It may be obvious at this point that the supplied event isn't very useful. The `fs.watch` API is part of the low-level functionality of the fs module, it's repeating the events generated by the underlying operating system. So we can either use a library like `chokidar` as discussed at the beginning of this section or we can query and store information about files to determine that operations are occurring.

We can discover whether a file is added by maintaining a list of files, and removing files when we find that a file was removed. If the file is known to us, we can further distinguish between a content update and a status update by checking whether the Modified time is equal to the Change time. If they are equal it's a content update, since a write operation will cause both to update. If they aren't equal it's a status update.

```sh
'use strict'
const { join, resolve } = require('path')
const { watch, readdirSync, statSync } = require('fs')

const cwd = resolve('.')
const files = new Set(readdirSync('.'))
watch('.', (evt, filename) => {
  try {
    const { ctimeMs, mtimeMs } = statSync(join(cwd, filename))
    if (files.has(filename) === false) {
      evt = 'created'
      files.add(filename)
    } else {
      if (ctimeMs === mtimeMs) evt = 'content-updated'
      else evt = 'status-updated'
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      files.delete(filename)
      evt = 'deleted'
    } else {
      console.error(err)
    }
  } finally {
    console.log(evt, filename)
  }
})
```

This approach uses a Set (a unique list), initializing it with the array of files already present in the current workings directory. The current working directory is retrieved using resolve('.'), although it's more usual to use process.cwd(). We'll explore the process object in the next chapter. If the files set doesn't have a particular filename, the evt parameter is reassigned to 'created'. The fs.statSync method throws, it may be because the file does not exist. In that case, the catch block will receive an error object that has a code property set to 'ENOENT'. If this occurs the filename is removed from the files set and evt is reassigned to 'deleted'. Back up in the try block, if the filename is in the files set we check whether ctimeMs is equal to mtimeMs (these are time stats provided in milliseconds). If they are equal, evt is set to 'content-updated', if not it is set to 'status-updated'.

If we execute our code, and the add a new file and delete it, it will output more suitable event names:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/filesystem/imgs/fs-19.png" width="1000" />
  <br />
</p>