'use strict'

const { spawn } = require('child_process')

const sp = spawn(
  process.execPath,
  [`-e`, `console.log('subprocess stdio output')`]
)

console.log('pid is', sp.pid)

sp.stdout.pipe(process.stdout)

sp.on('close', (status) => {
  console.log('exit status was', status)
})