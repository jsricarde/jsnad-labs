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
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-1.png" width="1000" />
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
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-2.png" width="1000" />
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
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-3.png" width="1000" />
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
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-3.png" width="1000" />
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
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-4.png" width="1000" />
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
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-5.png" width="1000" />
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
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-6.png" width="1000" />
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
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-7.png" width="1000" />
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
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-8.png" width="1000" />
  <br />
</p>

Typically writable streams would be binary streams. However, in some cases object-mode readable-writable streams can be useful. In the next section we'll look at the remaining stream types.

## Readable-Writable Streams

In addition to the Readable and Writable stream constructors there are three more core stream constructors that have both readable and writable interfaces:

- `Duplex`
- `Transform`
- `PassThrough`

We will explore consuming all three, but only create the most common user stream: the `Transform` stream.

The `Duplex` stream constructor's prototype inherits from the `Readable` constructor but it also mixes in functionality from the Writable constructor.

With a `Duplex` stream, both read and write methods are implemented but there doesn't have to be a causal relationship between them. In that, just because something is written to a Duplex stream doesn't necessarily mean that it will result in any change to what can be read from the stream, although it might. A concrete example will help make this clear, a TCP network socket is a great example of a `Duplex` stream:

```sh
'use strict'
const net = require('net')
net.createServer((socket) => {
  const interval = setInterval(() => {
    socket.write('beat')
  }, 1000)
  socket.on('data', (data) => {
    socket.write(data.toString().toUpperCase())
  })
  socket.on('end', () => { clearInterval(interval) })
}).listen(3000)
```

The `net.createServer` function accepts a listener function which is called every time a client connects to the server. The listener function is passed a `Duplex` stream instance which we called `socket`. Every second, `socket.write('beat')` is called, this is the first place the writable side of the stream is used. The stream is also listened to for data events and an end event, in these cases we are interacting with the readable side of the `Duplex` stream. Inside the data event listener we also write to the stream by sending back the incoming data after transforming it to upper case. The end event is useful for cleaning up any resources or on-going operations after a client disconnects. In our case we use it to clear the one second interval.

In order to interact with our server, we'll also create a small client. The client `socket` is also a `Duplex` stream:

```sh
'use strict'
const net = require('net')
const socket = net.connect(3000)

socket.on('data', (data) => {
  console.log('got data:', data.toString())
})

setTimeout(() => {
  socket.write('all done')
  setTimeout(() => {
    socket.end()
  }, 250)
}, 3250)
```

The `net.connect` method returns a Duplex stream which represents the TCP client socket.

We listen for `data` events and log out the incoming data buffers, converting them to strings for display purposes. On the writable side, the `socket.write` method is called with a string, after three and a quarter seconds another payload is written, and another quarter second later the stream is ended by calling `socket.end`.

If we start both of the code examples as separate processes we can view the interaction:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-9.png" width="1000" />
  <br />
</p>

The purpose of this example is not to understand the net module in its entirety but to understand that it exposes a common API abstraction, a `Duplex` stream and to see how interaction with a `Duplex` stream works.

The Transform constructor inherits from the `Duplex` constructor. Transform streams are duplex streams with an additional constraint applied to enforce a causal relationship between the read and write interfaces. A good example is compression:

```sh
'use strict'
const { createGzip } = require('zlib')
const transform = createGzip()
transform.on('data', (data) => {
  console.log('got gzip data', data.toString('base64'))
})
transform.write('first')
setTimeout(() => {
  transform.end('second')
}, 500)
```

As data is written to the `transform` stream instance, `data` events are emitted on the readable side of that data in compressed format. We take the incoming data buffers and convert them to strings, using BASE64 encodings. This results in the following output:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-10.png" width="1000" />
  <br />
</p>

The way that `Transform` streams create this causal relationship is through how a transform stream is created. Instead of supplying read and `write` options functions, a `transform` option is passed to the `Transform` constructor:

```sh
'use strict'

const { Transform } = require('stream')

const { scrypt } = require('crypto')

const createReadWriteStream = () => {
    return new Transform({
        transform(chunk, enc, next) {
            scrypt(chunk, 'a-salt', 32, (err, key) => {
                if(err) {
                    next(err)
                    return
                } else {
                    next(null, key)
                }
            })
        }
    })
}

const transform = createReadWriteStream()
transform.on('data', (data) => {
    console.log('got some data', data)
})

transform.write('A\n')
transform.write('B\n')
transform.write('C\n')
transform.end('nothing more to write')
```

The `transform` option function has the same signature as the `write` option function passed to `Writable` streams. It accepts `chunk`, `enc` and the `next` function. However, in the `transform` option function the next function can be passed a second argument which should be the result of applying some kind of transform operation to the incoming `chunk`.

In our case we used the asynchronous callback-based `crypto.scrypt` method, as ever the key focus here is on streams implementation (to find out more about this method see the crypto.scrypt(password, salt, keylen[, options], callback) section of Node.js Documentation).

The `crypto.scrypt` callback is called once a key is derived from the inputs, or may be called if there was an error. In the event of an error we pass the error object to the next callback. In that scenario this would cause our transform stream to emit an error event. In the success case we call next(null, key). Passing the first argument as null indicates that there was no error, and the second argument is emitted as a data event from the readable side of the stream. Once we've instantiated our stream and assigned it to the transform constant, we write some payloads to the stream and then log out the hex strings we receive in the data event listener. The data is received as hex because we set the encoding option (part of the `Readable` stream options) to dictate that emitted data would be decoded to hex format. This produces the following result:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-10.png" width="1000" />
  <br />
</p>


The `PassThrough` constructor inherits from the `Transform` constructor. It's essentially a transform stream where no transform is applied. For those familiar with Functional Programming this has similar applicability to the `identity` function `((val) => val)`, that is, it's a useful placeholder when a transform stream is expected but no transform is desired. See Lab 12.2 "Create a Transform Stream" to see an example of `PassThrough` being used.

## Determining End-of-Stream

As we discussed earlier, there are at least four ways for a stream to potentially become inoperative:

We often need to know when a stream has closed so that resources can be deallocated, otherwise memory leaks become likely.

Instead of listening to all four events, the `stream.finished` utility function provides a simplified way to do this:

```sh
'use strict'
const net = require('net')
const { finished } = require('stream')
net.createServer((socket) => {
  const interval = setInterval(() => {
    socket.write('beat')
  }, 1000)
  socket.on('data', (data) => {
    socket.write(data.toString().toUpperCase())
  })
  finished(socket, (err) => {
    if (err) {
      console.error('there was a socket error', err)
    }
    clearInterval(interval)
  })
}).listen(3000)
```

Taking the example on the previous "Readable-Writable Streams" page, we replaced the end event listener with a call to the `finished` utility function. The stream (socket) is passed to `finished` as the first argument and the second argument is a callback for when the stream ends for any reason. The first argument of the callback is a potential error object. If the stream were to emit an error event the callback would be called with the error object emitted by that event. This is a much safer way to detect when a stream ends and should be standard practice, since it covers every eventuality.

## Piping Streams

We can now put everything we've learned together and discover how to use a terse yet powerful abstraction: piping. Piping has been available in command line shells for decades, for instance here's a common Bash command:

```sh
cat some-file | grep find-something
```

The pipe operator instructs the console to read the stream of output coming from the left-hand command (`cat some-file`) and write that data to the right-hand command (`grep find-something`). The concept is the same in Node, but the pipe method is used.

Let's adapt the TCP client server from the "Readable-Writable Streams" page to use the pipe method. Here is the client server from earlier:

```sh
'use strict'
const net = require('net')
const socket = net.connect(3000)

socket.on('data', (data) => {
  console.log('got data:', data.toString())
})

socket.write('hello')
setTimeout(() => {
  socket.write('all done')
  setTimeout(() => {
    socket.end()
  }, 250)
}, 3250)
```

We'll replace the data event listener with a `pipe`:

```sh
'use strict'
const net = require('net')
const socket = net.connect(3000)

socket.pipe(process.stdout)

socket.write('hello')
setTimeout(() => {
  socket.write('all done')
  setTimeout(() => {
    socket.end()
  }, 250)
}, 3250)
```

Starting the example server from earlier and running the modified client results in the following:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-12.png" width="1000" />
  <br />
</p>

The `process` object will be explored in detail in Section 14 - "Process & Operating System", but to understand the code it's important to know that `process.stdout` is a `Writable` `stream`. Anything written to `process.stdout` will be printed out as process output. Note that there are no newlines, this is because we were using console.log before, which adds a newline whenever it is called.

The `pipe` method exists on `Readable` streams (recall `socket` is a `Duplex` stream instance and that `Duplex` inherits from `Readable`), and is passed a Writable stream (or a stream with Writable capabilities). Internally, the `pipe` method sets up a `data` listener on the `readable` stream and automatically writes to the writable stream as data becomes available.

Since pipe returns the stream passed to it, it is possible chain `pipe` calls together: `streamA.pipe(streamB).pipe(streamC)`. This is a commonly observed practice, but it's also bad practice to create pipelines this way. If a stream in the middle fails or closes for any reason, the other streams in the pipeline will not automatically close. This can create severe memory leaks and other bugs. The correct way to pipe multiple streams is to use the stream.pipeline utility function.

Let's combine the Transform stream we created on the "Readable-Writable Streams" pages and the TCP server as we modified it on the "Determining End-of-Stream" pages in order to create a pipeline of streams:

```sh
'use strict'
const net = require('net')
const { Transform, pipeline } = require('stream')
const { scrypt } = require('crypto')
const createTransformStream = () => {
  return new Transform({
    decodeStrings: false,
    encoding: 'hex',
    transform (chunk, enc, next) {
      scrypt(chunk, 'a-salt', 32, (err, key) => {
        if (err) {
          next(err)
          return
          }
        next(null, key)
      })
    }
  })
}

net.createServer((socket) => {
  const transform = createTransformStream()
  const interval = setInterval(() => {
    socket.write('beat')
  }, 1000)
  pipeline(socket, transform, socket, (err) => {
    if (err) {
      console.error('there was a socket error', err)
    }
    clearInterval(interval)
  })
}).listen(3000)
```

If we start both the modified TCP server and modified TCP client this will lead to the following result:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/streams/imgs/streams-13.png" width="1000" />
  <br />
</p>

The first 64 characters is the hex representation of a key derived from the '`hello`' string that the client Node process wrote to the client TCP `socket` Duplex `stream`. This was emitted as a `data` event on the TCP socket Duplex stream in the server Node process. It was then automatically written to our transform stream instance, which derived a key using `crypto.scrypt` within the transform option passed to the Transform constructor in our createTransformStream function. The result was then passed as the second argument of the next callback. This then resulted in a `data` event being emitted from the transform stream with the hex string of the derived key. That data was then written back to the server-side socket stream. Back in the client Node process, this incoming `data` was emitted as a `data` event by the client-side socket stream and automatically written to the process.stdout writable stream by the client Node process. The next 12 characters are the three beats written at one second intervals in the server. The final 64 characters are the hex representation of the derived key of the 'all done' string written to the client side socket. From there that payload goes through the exact same process as the first 'hello' payload.

The `pipeline` command will call pipe on every stream passed to it, and will allow a function to be passed as the final function. Note how we removed the finished utility method. This is because the final function passed to the `pipeline` function will be called if any of the streams in the `pipeline` close or fail for any reason.

Streams are a very large subject, this section has cut a pathway to becoming both productive and safe with streams. See Node.js Documentation to get even deeper on streams.