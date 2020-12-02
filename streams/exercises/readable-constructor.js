'use strict'

const { Readable } = require('streams')

const createReadableStream = () => {
    const data = ['some', 'data', 'to', 'read']
    return new Readable ({
        read () {
            if(data.length === 0) this.push(null)
            else this.push(data.shift())
        }
    })
}

const readable = createReadableStream()

readable.on('data', (data) => { console.log('got data', data) })
readable.on('end', () => { console.log('end of stream') })
