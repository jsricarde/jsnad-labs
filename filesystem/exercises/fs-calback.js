'use strict'

const { readFile, writeFile } = require('fs')
const { join } = require('path')

readFile(join(__dirname, 'out.txt'), (err, data) => {
    if (err) {
        console.error(err)
        return
    } else {
        writeFile(join(__dirname, 'out-2.txt'), data, (err) => {
            if (err) {
                console.error(err)
                return
            }

        })
    }
})