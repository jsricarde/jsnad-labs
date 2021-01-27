'use strict'

const { EventEmitter } = require('events')

const ee = new EventEmitter()
const listener1 = () => { console.log('listener 1') }
const listener2 = () => { console.log('listener 2') }

ee.on('tick', listener1)

setInterval(() => {
  ee.emit('tick')
}, 200)

setTimeout(() => {
  ee.removeListener('tick', listener1)
}, 500)

setTimeout(() => {
  ee.removeListener('tick', listener2)
}, 1100)