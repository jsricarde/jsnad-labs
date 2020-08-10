'use strict'
const { promisify } = require('util')

const print = (err, contents) => {
  if (err) console.error(err)
  else console.log(contents)
}

const opA = promisify((cb) => {
  setTimeout(() => {
    cb(null, 'A')
  }, 500)
})

const opB = promisify((cb) => {
  setTimeout(() => {
    cb(null, 'B')
  }, 250)
})

const opC = promisify((cb) => {
  setTimeout(() => {
    cb(null, 'C')
  }, 125)
})

async function run() {
  print(await opA())
  print(await opB())
  print(await opC())
}

run()
