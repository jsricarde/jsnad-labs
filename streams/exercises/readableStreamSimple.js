'use strict'

const { Readable } = require('stream')

const readable = Readable.from([ 'got', 'some', 'data' ])

readable.on('data', (data) => { console.log('got some data:', data) })
readable.on('end', () => { console.log('end stream') })