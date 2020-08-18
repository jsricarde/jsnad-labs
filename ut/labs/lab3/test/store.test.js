'use strict'
global.setTimeout = require('timers').setTimeout
const store = require('../store')

test('thrown with a store error', async () => {
  await expect(store(null))
  .rejects
  .toStrictEqual(Error('input must be a buffer'))
});

test('should have a success response', async () => {
  const data = await store(Buffer.from('some data'))
  expect(data).toHaveProperty('id');
  expect(data.id).toHaveLength(4)
});