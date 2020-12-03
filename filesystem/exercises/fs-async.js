'use strict'

const { join } = require('path')
const { readFile, writeFile } = require('fs').promises

async function run(params) {
    const contents = await readFile(__filename, {encoding: 'utf8'})
    const out = join(__dirname, 'out-3.txt')
    const write = await writeFile(out, contents)
}

run().catch(console.error)
