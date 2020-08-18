'use strict'

const add = (a, b) => {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw Error('inputs must be numbers')
  }
  return a + b;
}

module.exports = add