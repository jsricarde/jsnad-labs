'use strict'

const { Transform } = require('stream')

const { scrypt } = require('crypto')

const createReadWriteStream = () => {
    return new Transform({
        transform(chunk, enc, next) {
            scrypt(chunk, 'a-salt', 32, (err, key) => {
                if(err) {
                    next(err)
                    return
                } else {
                    next(null, key)
                }
            })
        }
    })
}

const transform = createReadWriteStream()
transform.on('data', (data) => {
    console.log('got some data', data)
})

transform.write('A\n')
transform.write('B\n')
transform.write('C\n')
transform.end('nothing more to write')