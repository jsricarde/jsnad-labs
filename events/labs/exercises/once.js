'use strict'
const assert = require('assert')
const { EventEmitter } = require('events')

const ee = new EventEmitter()
let count = 0

ee.once('tick', listener)

setInterval(() => {  ee.emit('tick')}, 100)

function listener () {  
    count++  
    setTimeout(() => {    
        assert.strictEqual(count, 1)    
        assert.strictEqual(this, ee)    
        console.log('passed!')  
    }, 250)
}