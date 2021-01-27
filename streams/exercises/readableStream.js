'use strict'

const { Readable } = require('stream')

const createReadableStream = () => {
  const data = [ 'some', 'data', 'to', 'read' ]
  return new Readable({
    read() {
      if (data.length === 0) {
        this.push(null)
      } else {
        this.push(data.shift())
      }
    }
  })
}

const readable = createReadableStream()

readable.on('data', (data) => {
  console.log('got data', data.toString())
})

readable.on('end', () => { console.log('finished reading') })

