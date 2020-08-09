const buffer = Buffer.from('👀')
const json = JSON.stringify(buffer)
const parsed = JSON.parse(json)
console.log('json', json)
console.log('parsed', parsed)
console.log('Buffer initial', buffer)
console.log('Buffer final', Buffer.from(parsed.data))