'use strict'

const { EventEmitter } = require('events')

const ee = new EventEmitter()

ee.on('tick', () => { console.log('2nd') })

ee.prependListener('tick', () => { console.log('1st') })

ee.emit('tick')