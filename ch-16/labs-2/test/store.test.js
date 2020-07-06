'use strict'
const store = require('../store')

test('handles network errors', (done) => {
  store(null, (err) => {
    expect(err).toStrictEqual(Error('input must be a buffer'))
    done()
  })
})

test('responds with data', (done) => {
  store(Buffer.from('holi'), (err, data) => {
    expect(err == null).toBe(true)
    //expect(Buffer.isBuffer(data)).toBeTruthy()
    expect(data).toMatchSnapshot()
    done()
  })
})