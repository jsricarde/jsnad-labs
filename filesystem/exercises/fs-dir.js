'use strict'

const { readdir, readdirSync } = require('fs')
const {readdir: readDirProm } = require('fs').promises
const { join } = require('path')

const out = join(__dirname, 'directories')

try {
    const directories = readdirSync(out)
    console.log('sync: ', directories);  
} catch (err) {
    console.error(err)
}

async function run() {
    const directories = await readDirProm(out)
    console.log('async: ', directories);
}

readdir(out, (err, directories) => {
    if (err) {
        console.error(err)
        return
    } else {
        console.log('callback: ', directories);
    }
})

run().catch(console.error)

