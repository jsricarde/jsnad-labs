'use strict'

module.exports = (url, cb) => {
  if(url === 'http://error.com') {
    return cb(new Error('network error'))
  } else {
    return cb(null, Buffer.from('some data'))
  }
}