'use strict'

const { spawn } = require('child_process')

const sp = spawn(process.execPath, [
  '-e',
  'console.error("err output"); console.log("hi"); process.stdin.pipe(process.stdout)'
],
  {
    stdio: [ 'pipe', 'inherit', process.stdout ]
  }
)

sp.stdin.write('this will come an output')
sp.stdin.end()