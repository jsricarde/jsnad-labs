'use strict'

const { readFile } = require('fs')

const [ bigFile, mediumFile, smallfile ] = Array.from(Array(3)).fill(__filename)

const print = (err, contents) => {
  if(err) {
    console.error(err)
    return
  }
  console.log(contents.toString())
}

readFile(bigFile, (err, contents) => {
  print(err, contents)
  readFile(mediumFile, (err, contents) => {
    print(err, contents)
    readFile(smallfile, print)
  })
})