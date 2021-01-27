'use strict'

const { EventEmitter } = require('events')

const ee = new EventEmitter()

ee.on('error', (err) => { console.log(err) })

ee.emit('error', new Error('oh oh'))

