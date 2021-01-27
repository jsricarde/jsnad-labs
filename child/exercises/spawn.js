'use strict'

const { spawn } = require('child_process')

const sp = spawn(process.execPath, [
  '-e',
  'process.exit(1)'
])

console.log('pid', sp.pid)

sp.stdout.pipe(process.stdout)