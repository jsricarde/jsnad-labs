'use strict'

const { Readable } = require("stream")

const readable = Readable.from(['some', 'data', 'to', 'read'])

readable.on('data', (data) => {
    console.log('some data to read', data)
})

readable.on('end', () => {
    console.log('end of the stream')
})