'use strict'
// make Jest work with nodes setTimeout instead of overriding it
global.setTimeout = require('timers').setTimeout
const req = require('../req-prom')

test('handles network errors', async () => {
  await expect(req('http://error.com'))
    .rejects
    .toStrictEqual(Error('network error'))
})

test('responds with data', async () => {
  const data = await req('http://example.com')
  expect(Buffer.isBuffer(data)).toBeTruthy()
  expect(data).toStrictEqual(Buffer.from('some data'))
})