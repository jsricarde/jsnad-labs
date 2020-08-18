'use strict'

const req = require('../req')

test('handles an error network', (done) => {
  req('http://error.com', (err) => {
    expect(err).toStrictEqual(Error('network error'))
    done()
  })
});

test('handles a data', (done) => {
  req('http://data.com', (err, data) => {
    expect(err === null).toBe(true)
    expect(Buffer.isBuffer(data)).toBeTruthy()
    expect(data).toStrictEqual(Buffer.from('some data'))
    done()
  })
});