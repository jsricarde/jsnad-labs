'use strict'

const { Transform } = require('stream')
const { scrypt } = require('crypto')
const { write } = require('fs')

const createTransform = () => {
  return new Transform({
    decodeStrings: false,
    encoding: 'hex',
    transform(chunk, enc, next) {
      scrypt(chunk, 'a-salt', 32, (err, key) => {
        if (err) {
          next(err)
          return
        }
        next(null, key)
      })
    }
  })
}

const transform = createTransform()
transform.on('data', (data) =>{
  console.log('got data', data)
})

transform.write('A\n')
transform.write('B\n')
transform.write('C\n')
transform.end('nothing more to write')
