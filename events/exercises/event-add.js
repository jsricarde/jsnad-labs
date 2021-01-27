'use strict'

const { EventEmitter } = require('events')

const ee = new EventEmitter()

ee.on('add', (a, b) => { console.log('result:', a + b) })


ee.emit('add', 4, 5)