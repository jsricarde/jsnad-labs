'use strict'

const { spawnSync } = require('child_process')

const result = spawnSync(process.execPath, [ '-e', 'console.log("hi")' ])

console.log(result.stdout.toString())