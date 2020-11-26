## Creating an Event Emitter

The `events` module exports an `EventEmitter` constructor:

```sh
const { EventEmitter } = require('events')
```

In modern node the `events` module is the `EventEmitter` constructor as well:

```sh
const EventEmitter = require('events')
```

Both forms are fine for contemporary Node.js usage.

To create a new event emitter, call the constructor with `new`:

```sh
const myEmitter = new EventEmitter()
```

A more typical pattern of usage with EventEmitter, however, is to inherit from it:

```sh
class MyEmitter extends EventEmitter {
  constructor (opts = {}) {
    super(opts)
    this.name = opts.name
  }
}
```

## Emitting Events

To emit an event call the emit method:

```sh
const { EventEmitter } = require('events')
const myEmitter = new EventEmitter()
myEmitter.emit('an-event', some , args)
```

The first argument passed to `emit` is the event namespace. In order to listen to an event this namespace has to be known. The subsequent arguments will be passed to the listener.

The following is an example of using `emit` with inheriting from `EventEmitter`:

```sh
const { EventEmitter } = require('events')
class MyEmitter extends EventEmitter {
  constructor(opts = {}) {
    super(opts)
    this.name = opts.name
  }

  destroy(err) {
    if(err) { this.emit('error', err) }
    thids.emit('close')
  }
}
```

The `destroy` method we created for the `MyEmitter` constructor class calls `this.emit`. It will also emit a close event. If an error object is passed to `destroy` it will emit an error event and pass the error object as an argument.

## Listening

To add a listener to an event emitter the `addListener` method or it's alias on method is used:

```sh
const { EventEmitter } = require('events')
const ee = new EventEmitter()
ee.on('close', () => { console.log('close event fired!') })
ee.emit('close')
```

The key line here is:

```sh
ee.on('close', () => { console.log('close event fired!') })
```

It could also be written as:

```sh
ee.addListener('close', () => {
  console.log(close event fired!')
})
```

Arguments passed to `emit` are received by the listener function:

```sh
ee.on('add', (a,b) => {
  console.log(a+b)
})

ee.emit('add', 6, 7)
```

Ordering is important, in the following will the event listener will not fire:

```sh
ee.emit('close')
ee.on('close', () => { console.log('close event fired!') })
```

This is because the event is emitted before the listener is added.

Listeners are also called in the order that they are registered:

```sh
const { EventEmitter } = require('events')
const ee = new EventEmitter()
ee.on('my-event', () => { console.log('1st') })
ee.on('my-event', () => { console.log('2nd') })
ee.emit('my-event')
```

The `prependListener` method can be used to inject listeners into the top position:

```sh
const { EventEmitter } = require('events')
const ee = new EventEmitter()
ee.on('my-event', () => { console.log('2nd') })
ee.prependListener('my-event', () => { console.log('1st') })
ee.emit('my-event')
```

## Single Use Listener

An event can also be emitted more than once:

```sh
const { EventEmitter } = require('events')
const ee = new EventEmitter()
ee.on('my-event', () => { console.log('my-event fired') })
ee.emit('my-event')
ee.emit('my-event')
ee.emit('my-event')
```

The once method will immediately remove its listener after it has been called:

```sh
const { EventEmitter } = require('events')
const ee = new EventEmitter()
ee.once('my-event', () => { console.log('my-event fired') })
ee.emit('my-event')
ee.emit('my-event')
ee.emit('my-event')
```

## Removing Listeners

The `removeListener` method can be used to remove a previously registered listener.

The `removeListener` method takes two arguments, the event name and the listener function.

In the following example, the listener1 function will be called twice, but the `listener2` function will be called five times:

```sh
const { EventEmitter } = require('events')
const ee = new EventEmitter()

const listener1 = () => { console.log('listener 1') }
const listener2 = () => { console.log('listener 2') }

ee.on('my-event', listener1)
ee.on('my-event', listener2)

setInterval(() => {
  ee.emit('my-event')
}, 200)

setTimeout(() => {
  ee.removeListener('my-event', listener1)
}, 500)

setTimeout(() => {
  ee.removeListener('my-event', listener2)
}, 1100)
```

The 'my-event' event is emitted every 200 milliseconds. After 500 milliseconds the `listener1` function is removed. So `listener1` is only called twice before it's removed. But at the 1100 milliseconds point, `listener2` is removed. So `listener2` is triggered five times.

The `removeAllListeners` method can be used to remove listeners without having a reference to their function. It can take either no arguments in which case every listener on an event emitter object will be removed, or it can take an event name in order to remove all listeners for a given event.

The following will trigger two 'my-event' listeners twice, but will trigger the 'another-event' listener five times:

```sh
const { EventEmitter } = require('events')
const ee = new EventEmitter()

const listener1 = () => { console.log('listener 1') }
const listener2 = () => { console.log('listener 2') }

ee.on('my-event', listener1)
ee.on('my-event', listener2)
ee.on('another-event', () => { console.log('another event') })

setInterval(() => {
  ee.emit('my-event')
  ee.emit('another-event')
}, 200)

setTimeout(() => {
  ee.removeAllListeners('my-event')
}, 500)

setTimeout(() => {
  ee.removeAllListeners()
}, 1100)
```

The '`my-event`' and '`another-event`' events are triggered every 200 milliseconds. After 500 milliseconds all listeners for '`my-event`' are removed, so the two listeners are triggered twice before they are removed. After 1100 milliseconds `removeAllLIsteners` method is called with no arguments, which removes the remaining '`another-event`' listener, thus it is called five times.

## Error Event

Emitting an '`error`' event on an event emitter will cause the event emitter to throw an exception if a listener for the '`error`' event has not been registered:

Consider the following:

```sh
const { EventEmitter } = require('events')
const ee = new EventEmitter()

process.stdin.resume() // keep process alive

ee.emit('error', new Error('oh oh'))
```

This will cause the process to crash and output an error stack trace.

If a listener is registered for the error event the process will no longer crash:

```sh
const { EventEmitter } = require('events')
const ee = new EventEmitter()

process.stdin.resume() // keep process alive

ee.on('error', (err) => {
  console.log('got error:', err.message )
})

ee.emit('error', new Error('oh oh'))
```