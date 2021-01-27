'use strict'

const { watch } = require('chokidar')
const { existsSync, mkdirSync, rmdirSync, statSync } = require('fs')
const { join, basename } = require('path')

const directories = join(__dirname, 'directories')
const outDir = join(__dirname)
const watcher = watch(directories, { persistent: true })

watcher.on('add', (path, stats) => {
    const stat = statSync(path)
    const file = basename(path)
    console.log(file, stat.uid)
})


watcher.on('addDir', (path, stats) => {
    const stat = statSync(path)
    const diretory = basename(path)
    const newDiretory = join(__dirname, diretory)
    if (stat.isDirectory() && path !== directories) {
        if (existsSync(newDiretory)) {
            rmdirSync(newDiretory)
        }
        rmdirSync(path)

        mkdirSync(newDiretory)
    }
    console.log(diretory, stat.uid)
})