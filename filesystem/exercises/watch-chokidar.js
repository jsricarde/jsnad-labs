'use strict'
const chokidar = require('chokidar')
const {join, basename} = require('path')
const { statSync, mkdirSync, rmdirSync } = require('fs')
const watcher = chokidar.watch(join(__dirname, 'directories'), {
    persistent: true
})

const log = console.log.bind(console);

watcher.on('add', (path, stats) => {
    const stat = statSync(path)
    console.log(basename(path), stat.uid)
    console.log(stat.uid)
    // if (stats) console.log(`File ${path} changed size to ${stats.size}`);
});

watcher.on('addDir', (path, stats) => {
    const stat = statSync(path)
    const dirName = basename(path)
    if(dirName === 'hi') {
        mkdirSync(join(__dirname, dirName))
        rmdirSync(path)
    }
    console.log(basename(path), stat.uid)
    // if (stats) console.log(`File ${path} changed size to ${stats.size}`);
});
