### STDIO

The ability to interact with terminal input and output is known as standard input/output, or STDIO. The process object exposes three streams:

- `process.stdin`
A Readable stream for process input.
- `process.stdout`
A Writable stream for process output.
- `process.stderr`
A Writable stream for process error output.

Since we're dealing with streams, we can take the uppercase stream from the previous chapter and pipe from `process.stdin` through the uppercase stream and out to `process.stdout`:

```sh
'use strict'
console.log('initalizated')
const { Transform } = require('stream')

const createTransform = Transform({
  transform: (chunk, enc, next) => {
    next(null, chunk.toString().toUpperCase())
  }
})

process.stdin.pipe(createTransform).pipe(process.stdout)
```