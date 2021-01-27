'use strict'

const { spawn } = require('child_process')

const sp = spawn(process.execPath, [
  '-e',
  'console.error("err output"); process.stdin.pipe(process.stdout)'
],
  {
    stdio: [ 'pipe', , 'pipe', 'pipe' ]
  }
)

sp.stdout.pipe(process.stdout)
sp.stderr.pipe(process.stdout)
sp.stdin.write('this will come an output')
sp.stdin.end()