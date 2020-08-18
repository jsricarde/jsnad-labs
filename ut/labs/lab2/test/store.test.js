'use strict'
const store = require('../store')
test('thrown with a store error', (done) => {
  store(null, (err)=>{
    expect(err).toStrictEqual(Error('input must be a buffer'))
    done()
  })
});

test('thrown with a success response', (done) => {
  store(Buffer.from('some data'), (err, data) => {
    expect(err === null).toBe(true)
    expect(data).toHaveProperty('id');
    expect(data.id).toHaveLength(4)
    done()
  })
});