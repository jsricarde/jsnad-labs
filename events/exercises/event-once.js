'use strict'

const { EventEmitter } = require('events')

const ee = new EventEmitter()

ee.once('tick', () => { console.log('new event fired') })

ee.emit('tick')
ee.emit('tick')

