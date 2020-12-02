## Stream Types

The Node core `stream` module exposes six constructors for creating streams:

- `Stream`
- `Readable`
- `Writable`
- `Duplex`
- `Transform`
- `PassThrough`

Other common Node core APIs such as process, `net`, `http` and `fs`, `child_process` expose streams created with these constructors.

The `Stream` constructor is the default export of the `stream` module and inherits from the `EventEmitter` constructor from the events module. The Stream constructor is rarely used directly, but is inherited from by the other constructors.

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-1.png" width="800" />
  <br />
</p>

The only thing the `Stream` constructor implements is the `pipe` method, which we will cover later in this section.

The main events emitted by various `Stream` implementations that one may commonly encounter in application-level code are:

- data
- end
- finish
- close
- error

The data and end events will be discussed on the "Readable Streams" page later in this section, the finish is emitted by Writable streams when there is nothing left to write.

The close and error events are common to all streams. The error event may be emitted when a stream encounters an error, the close event may be emitted if a stream is destroyed which may happen if an underlying resource is unexpectedly closed. It's noteworthy that there are four events that could signify the end of a stream. On the "Determining End-of-Stream" page further in this section, we'll discuss a utility function that makes it easier to detect when a stream has ended.

For a full list of events see Class: stream.Writable and Class: stream.Readable sections of the Node.js Documentation

## Readable Streams

The `Readable` constructor creates readable streams. A readable stream could be used to read a file, read data from an incoming HTTP request, or read user input from a command prompt to name a few examples. The `Readable` constructor inherits from the Stream constructor which inherits from the `EventEmitter` constructor, so readable streams are event emitters. As data becomes available, a readable stream emits a data event.

The following is an example demonstrating the consuming of a readable stream

```sh
'use strict'

const fs = require('fs')

const readable = fs.createReadStream(__filename)

readable.on('data', (data) => {
    console.log(data)
})

readable.on('end', () => {
    console.log('end of this')
})
```

The `fs` module here is used for demonstration purposes, readable stream interfaces are generic. The file system is covered in the next section, so we'll avoid in-depth explanation. But suffice to say the `createReadStream` method instantiates an instance of the `Readable` constructor and then causes it to emit data events for each chunk of the file that has been read. In this case the file would be the actual file executing this code, the implicitly available `__filename` refers to the file executing the code. Since it's so small only one data event would be emitted, but readable streams have a default `highWaterMark` option of 16kb. That means 16kb of data can be read before emitting a data event. So in the case of a file read stream, 64kb file would emit four data events. When there is no more data for a readable stream to read, an end event is emitted.

Readable streams are usually connected to an I/O layer via a C-binding, but we can create a contrived readable stream ourselves using the `Readable` constructor:

```sh
'use strict'

const { Readable } = require('streams')

const createReadableStream = () => {
    const data = ['some', 'data', 'to', 'read']
    return new Readable ({
        read () {
            if(data.length === 0) this.push(null)
            else this.push(data.shift())
        }
    })
}

const readable = createReadableStream()

readable.on('data', (data) => { console.log('got data', data) })
readable.on('end', () => { console.log('end of stream') })
```

To create a readable stream, the Readable constructor is called with the new keyword and passed an options object with a read method. The read function is called any time Node internals request more data from the readable stream. The this keyword in the read method points to the readable stream instance, so data is sent from the read stream by calling the push method on the resulting stream instance. When there is no data left, the push method is called, passing null as an argument to indicate that this is the end-of-stream. At this point Node internals will cause the readable stream to emit the end event.

When this is executed four data events are emitted, because our implementation pushes each item in the stream. The read method we supply to the options object passed to the Readable constructor takes a size argument which is used in other implementations, such as reading a file, to determine how many bytes to read. As we discussed, this would typically be the value set by the highWaterMark option which defaults to 16kb.

The following shows what happens when we execute this code:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-2.png" width="800" />
  <br />
</p>


Notice how we pushed strings to our readable stream but when we pick them up in the data event they are buffers. Readable streams emit buffers by default, which makes sense since most use-cases for readable streams deal with binary data.

In the previous section, we discussed buffers and various encodings. We can set an encoding option when we instantiate the readable stream for the stream to automatically handle buffer decoding:

```sh
'use strict'

const { Readable } = require('stream')

const createReadableStream = () => {
    const data = ['some', 'data', 'to', 'read']
    return new Readable({
        encoding: 'utf8',
        read () {
            if(data.length === 0) this.push(null)
            else this.push(data.shift())
        }
    })
}

const readable = createReadableStream()

readable.on('data', (data) => {
    console.log('some data to read', data)
})

readable.on('end', () => {
    console.log('end of the stream')
})
```

If we were to run this example code again with this one line changed, we would see the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-3.png" width="800" />
  <br />
</p>

Now when each `data` event is emitted it receives a string instead of a buffer. However because the default stream mode is `objectMode`: `false`, the string is pushed to the readable stream, converted to a buffer and then decoded to a string using UTF8.

When creating a readable stream without the intention of using buffers, we can instead set `objectMode` to true:



```sh
'use strict'

const { Readable } = require('stream')

const createReadableStream = () => {
    const data = ['some', 'data', 'to', 'read']
    return new Readable({
        objectMode: true,
        read () {
            if(data.length === 0) this.push(null)
            else this.push(data.shift())
        }
    })
}

const readable = createReadableStream()

readable.on('data', (data) => {
    console.log('=>', data)
})

readable.on('end', () => {
    console.log('end of the stream')
})
```

This will again create the same output as before:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-3.png" width="800" />
  <br />
</p>

However this time the string is being sent from the readable stream without converting to a buffer first.

Our code example can be condensed further using the `Readable.from` utility method which creates streams from iterable data structures, like arrays:

```sh
'use strict'

const { Readable } = require("stream")

const readable = Readable.from(['some', 'data', 'to', 'read'])

readable.on('data', (data) => {
    console.log('some data to read', data)
})

readable.on('end', () => {
    console.log('end of the stream')
})
```

This will result in the same output, the data events will receive the data as strings.

Contrary to the Readable constructor, the Readable.from utility function sets objectMode to true by default. For more on Readable.from see stream.Readable.from(iterable, [options]) section of the Node.js Documentation.

## Writable Streams

The Writable constructor creates writable streams. A writable stream could be used to write a file, write data to an HTTP response, or write to the terminal. The Writable constructor inherits from the Stream constructor which inherits from the EventEmitter constructor, so writable streams are event emitters.

To send data to a writable stream, the write method is used:

```sh
'use strict'
const fs = require('fs')
const writable = fs.createWriteStream('./out')

writable.on('finish', () => { console.log('finished writing') })
writable.write('A\n')
writable.write('B\n')
writable.write('C\n')
writable.end('nothing to write')
```

The `write` method can be called multiple times, the end method will also write a final payload to the stream before ending it. When the stream is ended, the `finish` event is emitted. Our example code will take the string inputs, convert them to Buffer instance and then write them to the `out` file. Once it writes the final line it will output `finished writing`:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-4.png" width="800" />
  <br />
</p>

As with the read stream example, let's not focus on the `fs` module at this point, the characteristics of writable streams are universal.

Also similar to readable streams, writable streams are mostly useful for I/O, which means integrating a writable stream with a native C-binding, but we can likewise create a contrived write stream example:

```sh
'use strict'

const { Writable } = require('stream')

const createWritableStream = (data) => {
    return new Writable({
        write(chunk, enc, next) {
            data.push(chunk)
            next()
        }
    })
}

const data = []
const writable = createWritableStream(data)
writable.on('finish', () => { console.log('finished writing', data) })
writable.write('A\n')
writable.write('B\n')
writable.write('C\n')
writable.end('nothing more to write')
```

To create a writable stream, call the `Writable` constructor with the new keyword. The options object of the `Writable` constructor can have a `write` function, which takes three arguments, which we called `chunk`, `enc`, and `next`. The `chunk` is each piece of data written to the stream, enc is encoding which we ignore in our case and `next` is callback which must be called to indicate that we are ready for the `next` piece of data.

The point of a `next` callback function is to allow for asynchronous operations within the write option function, this is essential for performing asynchronous I/O. We'll see an example of asynchronous work in a stream prior to calling a callback in the following section.

In our implementation we add each chunk to the data array that we pass into our createWriteStream function.

When the stream is finished the data is logged out:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-5.png" width="800" />
  <br />
</p>

Note again, as with readable streams, the default `objectMode` option is `false`, so each string written to our writable stream instance is converted to a buffer before it becomes the chunk argument passed to the write option function. This can be opted out of by setting the `decodeStrings` option to false:

```sh
'use strict'

const { Writable } = require('stream')

const createWritableStream = (data) => {
    return new Writable({
        decodeStrings: false,
        write(chunk, enc, next) {
            data.push(chunk)
            next()
        }
    })
}

const data = []
const writable = createWritableStream(data)
writable.on('finish', () => { console.log('finished writing', data) })
writable.write('A\n')
writable.write('B\n')
writable.write('C\n')
writable.end('nothing more to write')
```

This will result in the following output:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-6.png" width="800" />
  <br />
</p>

This will only allow strings or Buffers to be written to the stream, trying to pass any other JavaScript value will result in an error:

```sh
'use strict'
const { Writable } = require('stream')
const createWriteStream = (data) => {
  return new Writable({
    decodeStrings: false,
    write (chunk, enc, next) {
      data.push(chunk)
      next()
    }
  })
}
const data = []
const writable = createWriteStream(data)
writable.on('finish', () => { console.log('finished writing', data) })
writable.write('A\n')
writable.write(1)
writable.end('nothing more to write')
```

The above code would result in an error, causing the process to crash because we're attempting to write a JavaScript value that isn't a string to a binary stream:


<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-7.png" width="800" />
  <br />
</p>

Stream errors can be handled to avoid crashing the process, because streams are event emitters and the same special case for the `error` event applies. We'll explore that more on the "Determining End-of-Stream" page later in this section.

If we want to support strings and any other JavaScript value, we can instead set `objectMode` to true to create an object-mode writable stream:

```sh
'use strict'
const { Writable } = require('stream')
const createWriteStream = (data) => {
  return new Writable({
    objectMode: true,
    write (chunk, enc, next) {
      data.push(chunk)
      next()
    }
  })
}
const data = []
const writable = createWriteStream(data)
writable.on('finish', () => { console.log('finished writing', data) })
writable.write('A\n')
writable.write(1)
writable.end('nothing more to write')
```

By creating an object-mode stream, writing the number 1 to the stream will no longer cause an error:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-8.png" width="800" />
  <br />
</p>

Typically writable streams would be binary streams. However, in some cases object-mode readable-writable streams can be useful. In the next section we'll look at the remaining stream types.

