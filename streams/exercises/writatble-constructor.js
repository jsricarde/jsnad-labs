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