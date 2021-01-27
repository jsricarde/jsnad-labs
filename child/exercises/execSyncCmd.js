'use strict'

const platform = process.cwd()
const { execSync } = require('child_process')
const cwd = platform === 'win32' ? 'dir' : 'ls'
const result = execSync(cwd)

console.log(result.toString())