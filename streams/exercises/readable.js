'use strict'

const fs = require('fs')

const readable = fs.createReadStream(__filename)

readable.on('data', (data) => {
    console.log(data)
})

readable.on('end', () => {
    console.log('end of this')
})