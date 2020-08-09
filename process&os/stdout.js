'use strict'
console.log(process.stdin.isTTY ? 'terminal' : 'piped to')

const { Transform } = require('stream')

const createTransform = Transform({
  transform: (chunk, enc, next) => {
    next(null, chunk.toString().toUpperCase())
  }
})

process.stdin.pipe(createTransform).pipe(process.stdout)
