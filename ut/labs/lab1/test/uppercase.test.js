
'use strict'
const uppercase = require('../uppercase')

test('not uppercase the word', async () => {
  expect(() => uppercase(3)).toThrowError(
    Error('input must be a string')
  )
})

test('uppercase the word', async () => {
  expect(uppercase('hi')).toBe('HI')
})