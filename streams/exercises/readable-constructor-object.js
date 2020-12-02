'use strict'

const { Readable } = require('stream')

const createReadableStream = () => {
    const data = ['some', 'data', 'to', 'read']
    return new Readable({
        objectMode: true,
        read () {
            if(data.length === 0) this.push(null)
            else this.push(data.shift())
        }
    })
}

const readable = createReadableStream()

readable.on('data', (data) => {
    console.log('=>', data)
})

readable.on('end', () => {
    console.log('end of the stream')
})