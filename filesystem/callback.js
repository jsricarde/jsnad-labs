'use strict'

const { join } = require('path')
const { readFile, writeFile } = require('fs')

readFile(__filename, {encoding: 'utf8'}, (err, contents) => {
  if (err) {
    console.error('somenthing bad happened in read', err)
  }
  const toUpper = contents.toUpperCase();
  const out = join(__dirname, 'out.txt')
  writeFile('out.txt', toUpper, (err)=>{
    if (err) { console.error(err) }
  })
})
