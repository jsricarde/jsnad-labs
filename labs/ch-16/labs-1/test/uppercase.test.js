
'use strict'
const { test } = require('tap')
const uppercase = require('../uppercase')

test('not uppercase the word', async ({ throws }) => {
  throws(() => uppercase(3), Error('input must be a string'))
})

test('uppercase the word', async ({ strictEqual }) => {
  strictEqual(uppercase('hi'), 'HI')
})