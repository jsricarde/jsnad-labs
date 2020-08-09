## Buffers
Always use `Buffer.alloc` for create a buffer with a set of bytes
`node -p "Buffer.alloc(10)"`

`// A buffer with a 10 bytes allocated`


### Convert buffers to strings
To create a buffer from string we can use the code below:

`const buffer = Buffer.from('my buffer')`

The buffer `.from` method encondes with a `utf8` default format we can use also the `utf16le`. And we see it result with a different buffer byte values:

```sh
node -p "Buffer.from('A')"
<Buffer 41>
node -p "Buffer.from('A', 'utf16le')"
<Buffer 41 00>
```

The supported byte-to-text encodings are hex and base64:
```sh
node -p "Buffer.from('8J+RgA==', 'base64')"
<Buffer f0 9f 91 80>
node -p "Buffer.from('👀')"
<Buffer f0 9f 91 80>
```

### Converting Buffers to Strings

To covert a buffer to a string we can use the `.toString` method on a `Buffer` instance:

```sh
const buffer = Buffer.from('👀')
console.log(buffer.toString()) // outputs 👀
```

The `.toString` method can be set in other string encodings:

```sh
const buffer = Buffer.from('👀')
console.log(buffer.toString('base64')) // outputs 8J+RgA==
console.log(buffer.toString('hex')) // outputs f09f9180
```

The UTF8 encoding format has between 1 and 4 bytes to represent each character, if for any reason one or more bytes is truncated from a character this will result in encoding errors. So in situations where we have multiple buffers that might split characters across a byte boundary the Node core `string_decoder` module should be used.

```sh
const { StringDecoder } = require('string_decoder')
const frag1 = Buffer.from('f09f', 'hex')
const frag2 = Buffer.from('9180', 'hex')
console.log(frag1.toString()) // prints �
console.log(frag2.toString()) // prints ��
const decoder = new StringDecoder()
console.log(decoder.write(frag1)) // prints nothing
console.log(decoder.write(frag2)) // prints 👀
```

### JSON Serializing and Deserializing Buffers

So `Buffer` instances are represented in `JSON` by an object that has a type property with a string value of `Buffer` and a data property with an array of numbers, representing the value of each byte in the buffer.

When deserializing, `JSON.parse` will only turn that JSON representation of the buffer into a plain JavaScript object, to turn it into an object the data array must be passed to `Buffer.from`:

```sh
const buffer = Buffer.from('👀')
const json = JSON.stringify(buffer)
const parsed = JSON.parse(json)
console.log('json', json)
console.log('parsed', parsed)
console.log('Buffer initial', buffer)
console.log('Buffer final', Buffer.from(parsed.data))
```