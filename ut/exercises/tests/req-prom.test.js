'use strict'
// make Jest work with nodes setTimeout instead of overriding it
global.setTimeout = require('timers').setTimeout
const req = require('../req-prom')

test('err', async () => {
    await expect(req('http://error.com')).rejects.toStrictEqual(new Error('network error'))
})

test('success', async () => {
    const data = await req('http://example.com')
    expect(Buffer.isBuffer(data)).toBeTruthy()
    expect(data).toStrictEqual(Buffer.from('some data'))
})