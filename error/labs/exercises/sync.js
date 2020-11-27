'use strict'

const assert = require('assert')

function parseUrl (str) {  
    try {
        const parsed = new URL(str)  
        return parsed
    } catch (error) {
        if(error) return null
    }
    
}

assert.doesNotThrow(() => { parseUrl('invalid-url') })
assert.strictEqual(parseUrl('invalid-url'), null)
assert.deepStrictEqual(
    parseUrl('http://example.com'),
    new URL('http://example.com')
)
console.log('passed!')