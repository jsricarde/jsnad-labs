'use strict'

const { spawn, spawnSync } = require('child_process')
const { join } = require('path')

const assert = require('assert')
const { equal } = assert.strict


function exercise(myEnvVar) {
  const sp1 = spawnSync(
    process.argv[0],
    [
      '-e',
      'process.env',
      'child.js'
    ],
    {
      env: { MY_ENV_VAR: myEnvVar }
    }
  )
  // sp.stdout.pipe(process.stdout)
  return sp1.stdout

  // TODO return a child process with
  // a single environment variable set
  // named MY_ENV_VAR. The MY_ENV_VAR
  // environment variable's value should
  // be the value of the myEnvVar parameter
  // passed to this exercise function

  // return require('child_process').spawnSync(process.argv[0], ['-e', 'process.env.MY_ENV_VAR', 'child.js'])
}


try {
  const sp = exercise('is set')
  console.log('enter')

  if (Buffer.isBuffer(sp)) {
    console.log('buffer', sp.toString().trim())

    equal(sp.toString().trim(), 'passed!', 'child process misconfigured')
    // process.stdout.write(sp)

    return
  }
} catch (err) {
  console.log('err')

  const { status} = err
  if (status == null) throw err
  equal(status, 0, 'exit code should be 0')
  return
}

// module.exports = exercise
