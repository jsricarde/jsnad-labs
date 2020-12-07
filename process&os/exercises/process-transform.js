'use strict'

const { Transform } = require('stream')

const createTransformStream = () => {
    return new Transform({
        transform (chunk, enc, next) {
            next(null, chunk.toString().toUpperCase())
        }
    })
}

const uppercased = createTransformStream()

process.stdin.pipe(uppercased).pipe(process.stdout)