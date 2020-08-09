## Streams

Node core `stream` module exposes six constructors for creating streams:

  - `Stream`
  - `Readable`
  - `Writable`
  - `Duplex`
  - `Transform`
  - `PassThrough`

The main events emitted by various Stream implementations that one may commonly encounter in application-level code are:

 - `data`
 - `end`
 - `finish`
 - `close`
 - `error`

There are two stream modes:

- `Binary streams`
- `Object streams`

The default in a stream is set `false` the property `objectMode` that means it read or write only buffers. To use javascript primitive values strings, numbers) except null we set that property as `true`.

### Readable Streams

The `Readable` constructor creates a readable stream. It could be used to read a file, read data from a socket or HTTP request or a user Input from a command line. This inherents from the `EventEmmiter` constructor, then we can listen for the same event handlers.

```sh
'use strict'
const fs = require('fs')
const readable = fs.createReadStream(__filename)
readable.on('data', (data) => {
  console.log('got data', data)
})
readable.on('end', () => {
  console.log('finished reading')
})
```

Readable streams are usually connected to an I/O layer via a C-binding, but we can create a contrived readable stream ourselves using the `Readable` constructor:

```sh
'use strict'

const { Readable } = require('stream')

const createReadStream = () => {
  const data = ['some', 'data', 'to', 'read']
  return new Readable({
    read () {
      if(data.length === 0) {
        this.push(null)
      } else {
        this.push(data.shift())
      }
    }
  })
}

const readable = createReadStream()

readable.on('data', (data) =>{
  console.log('got data', data)
})

readable.on('end', () =>{
  console.log('end reading')
})
```

To create a readable stream, the `Readable` constructor is called with the new keyword and passed an options object with a read method. The read function is called any time Node internals request more data from the readable stream. The `this` keyword in the `read` method points to the readable stream instance, so data is sent from the read stream by calling the push method on the resulting stream instance. When there is no data left, the push method is called, passing `null` as an argument to indicate that this is the end-of-stream. At this point Node internals will cause the readable stream to emit the end event.

We can set an `encoding` option when we instantiate the readable stream for the stream to automatically handle buffer decoding:

```sh
'use strict'

const { Readable } = require('stream')

const createReadStream = () => {
  const data = ['some', 'data', 'to', 'read']
  return new Readable({
    encoding: 'utf8',
    read () {
      if(data.length === 0) {
        this.push(null)
      } else {
        this.push(data.shift())
      }
    }
  })
}

const readable = createReadStream()

readable.on('data', (data) =>{
  console.log('got data', data)
})

readable.on('end', () =>{
  console.log('end reading')
})
```

When creating a readable stream without the intention of using buffers, we can instead set `objectMode` to true:



```sh
'use strict'

const { Readable } = require('stream')

const createReadStream = () => {
  const data = ['some', 'data', 'to', 'read']
  return new Readable({
    objectMode: true,
    read () {
      if(data.length === 0) {
        this.push(null)
      } else {
        this.push(data.shift())
      }
    }
  })
}

const readable = createReadStream()

readable.on('data', (data) =>{
  console.log('got data', data)
})

readable.on('end', () =>{
  console.log('end reading')
})
```

However this time the string is being sent from the readable stream without
converting to a buffer first.

Our code example can be condensed further using the Readable.from utility
method which creates streams from iterable data structures, like arrays:

```sh
'use strict'

const { Readable } = require('stream')

const readable = Readable.from(['some', 'data', 'to', 'read'])

readable.on('data', (data) => {
  console.log('got data', data)
})

readable.on('end', () =>{
  console.log('end reading')
})
```

### Writable Streams

The `Writable` constuctor creates writable streams. A writable stream could be used to write a file, write data in a HTTP request or write data in a command line output. The Writable constructor inherits from the Stream constructor which inherits from the EventEmitter constructor, so writable streams are event emitters.

To send a data to a writable stream we need to use the `write` method:

```sh
'use strict'
const fs = require('fs')
const writable = fs.createWriteStream('./out')

writable.on('finish', () => { console.log('finished writing') })

writable.write('A\n')
writable.write('B\n')
writable.write('C\n')
writable.end('nothing more to write')
```

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

Note again, as with readable streams, the default objectMode option is false, so each string written to our writable stream instance is converted to a buffer before it becomes the chunk argument passed to the write option function. This can be opted out of by setting the `decodeStrings` option to false:

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

If we want to support strings and any other JavaScript value, we can instead set `objectMode` to `true` to create an object-mode writable stream:

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
### Readable-Writable Streams(Duplex)

In addition to the Readable and Writable stream constructors there are three more core stream constructors that have both readable and writable interfaces:

- `Duplex`
- `Transform`
- `PassThrough`

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

The `net.createServer` function accepts a listener function which is called every time a client connects to the server. The listener function is passed a Duplex stream instance which we called socket. Every second, `socket.write('beat')` is called, this is the first place the writable side of the stream is used. The stream is also listened to for data events and an end event, in these cases we are interacting with the readable side of the Duplex stream.

Inside the data event listener we also write to the stream by sending back the incoming data after transforming it to upper case. The end event is useful for cleaning up any resources or on-going operations after a client disconnects. In our case we use it to clear the one second interval.

In order to interact with our server, we'll also create a small client. The client socket is also a `Duplex` stream:

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

We listen for data events and log out the incoming data buffers, converting them to strings for display purposes. On the writable side, the `socket.write` method is called with a string, after three and a quarter seconds another payload is written, and another quarter second later the stream is ended by calling `socket.end`.

The `Transform` constructor inherits from the Duplex constructor. Transform streams are duplex streams with an additional constraint applied to enforce a causal relationship between the read and write interfaces. A good example is compression:

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

The way that `Transform` streams create this causal relationship is through how a transform stream is created. Instead of supplying `read` and `write` options functions, a transform option is passed to the `Transform` constructor:

```sh
'use strict'

const { Transform } = require('stream')
const { scrypt } = require('crypto')
const { write } = require('fs')

const createTransform = () => {
  return new Transform({
    decodeStrings: false,
    encoding: 'hex',
    transform(chunk, enc, next) {
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

const transform = createTransform()
transform.on('data', (data) =>{
  console.log('got data', data)
})

transform.write('A\n')
transform.write('B\n')
transform.write('C\n')
transform.end('nothing more to write')
```

### Determining End-of-Stream

As we discussed earlier, there are at least four ways for a stream to potentially become inoperative:

- `close` event
- `error` event
- `finish` event
- `end` event

We often need to know when a stream has closed so that resources can be deallocated, otherwise memory leaks become likely.

Instead of listening to all four events, the stream.finished utility function provides a simplified way to do this:

```sh
'use strict'

const net = require('net')
const { finished } = require('stream')

net.createServer((socket)=>{
  const interval = setInterval(() => {
    socket.write('beat')
  }, 1000);

  socket.on('data', (data) => {
    socket.write(data.toString().toUpperCase())
  })
  finished(socket, (err) => {
    if(err) {
      console.error('there was a socker error: ', err)
    }
    clearInterval(interval)
  })
}).listen(3000)
```
