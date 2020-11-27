## The Buffer Instance

The `Buffer` constructor is a global, so there's no need to require any core module in order to use the Node core Buffer API:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/buffers/imgs/buffer-1.png" width="800" />
  <br />
</p>


When the `Buffer` constructor was first introduced into Node.js the JavaScript language did not have a native binary type. As the language evolved the `ArrayBuffer` and a variety of Typed Arrays were introduced to provide different "views" of a buffer. For instance an `ArrayBuffer` instance be accessed with a `Float64Array` where each set of 8 bytes is interpreted as a 64-bit floating point number, or an `Int32Array` where each 4 bytes represents a 32bit, two's complement signed integer or a `Uint8Array` where each byte represents an unsigned integer between 0-255. For more info and a full list of possible typed arrays see "JavaScript Typed Arrays" by MDN web docs.

When these new data structures were added to JavaScript, the Buffer constructor internals were refactored on top of the `Uint8Array` typed array. So a buffer object is both an instance of Buffer and an instance (at the second degree) of `Uint8Array`.

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/buffers/imgs/buffer-2.png" width="800" />
  <br />
</p>

This means there are additional API's that can be availed of beyond the Buffer methods. For more information, see "Uint8Array" by MDN web docs. And for a full list of the Buffers API's which sit on top of the Uint8Array API see Node.js Documentation.

One key thing to note is that the `Buffer.prototype.slice` method overrides the `Uint8Array.prototype.slice` method to provide a different behavior. Whereas the `Uint8Array` slice method will take a copy of a buffer between two index points, the Buffer slice method will return a buffer instance that references the binary data in the original buffer that `slice` was called on:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/buffers/imgs/buffer-3.png" width="800" />
  <br />
</p>

In the above, when we create `buf2` by calling `buf1.slice(2, 3)` this is actually a reference to the third byte in `buf1`. So when we assign `buf2[0]` to 100, `buf1[2]` is also updated to the same, because it's the same piece of memory. However, using a Uint8Array directly, taking a slice of `buf3` to create `buf4` creates a copy of the third byte in `buf3` instead. So when `buf4[0]` is assigned to 100, `buf3[2]` stays at 0 because each buffer is referred to completely separate memory.


## Allocating Buffers

Usually a constructor would be called with the `new` keyword, however with `Buffer` this is deprecated and advised against. Do not instantiate buffers using `new`.

The correct way to allocate a buffer of a certain amount of bytes is to use `Buffer.alloc`:

```sh
const buffer = Buffer.alloc(10)
```

The above would allocate a buffer of 10 bytes. By default the `Buffer.alloc` function produces a zero-filled buffer:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/buffers/imgs/buffer-5.png" width="800" />
  <br />
</p>

When a buffer is printed to the terminal it is represented with <Buffer ...> where the ellipsis (…) in this case signifies a list of bytes represented as hexadecimal numbers. For instance a single byte buffer, where the byte's decimal value is 100 (and its binary value is 1100100), would be represented as <Buffer 64>.

Using `Buffer.alloc` is the safe way to allocate buffers. There is an unsafe way:

```sh
const buffer = Buffer.allocUnsafe(10)
```

Any time a buffer is created, it's allocated from unallocated memory. Unallocated memory is only ever unlinked, it isn't wiped. This means that unless the buffer is overwritten (e.g. zero-filled) then an allocated buffer can contain fragments of previously deleted data. This poses a security risk, but the method is available for advanced use cases where performance advantages may be gained and security and the developer is fully responsible for the security of the implementation.

Every time Buffer.allocUnsafe is used it will return a different buffer of garbage bytes:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/buffers/imgs/buffer-6.png" width="800" />
  <br />
</p>

In most cases, allocation of buffers won't be something we have to deal with on a regular basis. However if we ever do need to create a buffer, it's strongly recommended to use `Buffer.alloc` instead of `Buffer.unsafeAlloc`.

One of the reasons that `new` Buffer is deprecated is because it used to have the `Buffer.unsafeAlloc` behavior and now has the `Buffer.alloc` behavior which means using `new Buffer` will have a different outcome on older Node versions. The other reason is that new Buffer also accepts strings.

The key take-away from this section is: if we need to safely create a buffer, use `Buffer.alloc`.

## Converting Strings to Buffers

The JavaScript string primitive is a frequently used data structure, so it's important to cover how to convert from strings to buffers and from buffers to strings.

A buffer can be created from a string by using Buffer.from:

```sh
const buffer = Buffer.from('holi')
```

When a string is passed to `Buffer.from` the characters in the string are converted to byte values:


<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/buffers/imgs/buffer-7.png" width="800" />
  <br />
</p>

In order to convert a string to a binary representation, an encoding must be assumed. The default encoding that `Buffer.from` uses is UTF8. The UTF8 encoding may have up to four bytes per character, so it isn't safe to assume that string length will always match the converted buffer size.

For instance, consider the following:

```sh
console.log('👀'.length) // prints 2
console.log(Buffer.from('👀').length) // prints 4
```

Even though there is one character in the string, it has a length of 2. This is to do with how Unicode symbols work, but explaining the reasons for this in depth are far out of scope for this subject. However for a full deep dive into reasons for a single character string having a length of 2 see the following article "JavaScript Has a Unicode Problem" by Mathias Bynes.

When the string is converted to a buffer however, it has a length of 4. This is because in UTF8 encoding, the eyes emoji is represented with four bytes:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/buffers/imgs/buffer-8.png" width="800" />
  <br />
</p>

When the first argument passed to Buffer.from is a string, a second argument can be supplied to set the encoding. There are two types of encodings in this context: character encodings and binary-to-text encodings.

`UTF8` is one character encoding, another is `UTF16LE`.

When we use a different encoding it results in a buffer with different byte values:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/buffers/imgs/buffer-9.png" width="800" />
  <br />
</p>

It can also result in different buffer sizes, with UTF16LE encoding the character A is two bytes whereas 'A'.length would be 1.

The supported byte-to-text encodings are hex and base64. Supplying one of these encodings allows us to represent the data in a string, this can be useful for sending data across the wire in a safe format.

Assuming UTF8 encoding, the base64 representation of the eyes emoji is 8J+RgA==. If we pass that to Buffer.from and pass a second argument of 'base64' it will create a buffer with the same bytes as Buffer.from('👀'):

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/buffers/imgs/buffer-9.png" width="800" />
  <br />
</p>

## Converting Buffers to Strings

To convert a buffer to a string, call the `toString` method on a `Buffer` instance:

```sh
const buffer = Buffer.from('👀')
console.log(buffer) // <Buffer f0 9f 91 80>
console.log(buffer.toString()) // '👀'
console.log(buffer + '') // prints 👀
```
On the last line in the example code, we also concatenate buffer to an empty string. This has the same effect as calling the toString method.

The `toString` method can also be passed an encoding as an argument:

```sh
const buffer = Buffer.from('👀')
console.log(buffer) // <Buffer f0 9f 91 80>
console.log(buffer.toString('hex')) // f09f9180
console.log(buffer.toString('base64')) // 8J+RgA==
```

The `UTF8` encoding format has between 1 and 4 bytes to represent each character, if for any reason one or more bytes is truncated from a character this will result in encoding errors. So in situations where we have multiple buffers that might split characters across a byte boundary the Node core `string_decoder` module should be used.

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

Calling `decoder.write` will output a character only when all of the bytes representing that character have been written to the decoder:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/buffers/imgs/buffer-11.png" width="800" />
  <br />
</p>

## JSON Serializing and Deserializing Buffers

JSON is a very common serialization format, particularly when working with JavaScript-based applications. When `JSON.stringify` encounters any object it will attempt to call a `toJSON` method on that object if it exists. `Buffer` instances have a toJSON method which returns a plain JavaScript object in order to represent the buffer in a JSON-friendly way:

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/buffers/imgs/buffer-12.png" width="800" />
  <br />
</p>

So Buffer` instances are represented in JSON by an object that has a type property with a string value of 'Buffer' and a data property with an array of numbers, representing the value of each byte in the buffer.

When deserializing, `JSON.parse` will only turn that JSON representation of the buffer into a plain JavaScript object, to turn it into an object the data array must be passed to `Buffer.from`:

```sh
const buffer = Buffer.from('👀')
const json = JSON.stringify(buffer)
const parsed = JSON.parse(json)
console.log(parsed) // prints { type: 'Buffer', data: [ 240, 159, 145, 128 ] }
console.log(Buffer.from(parsed.data)) // prints <Buffer f0 9f 91 80>
```

When an array of numbers is passed to `Buffer.from` they are converted to a buffer with byte values corresponding to those numbers.

<p align="center">
  <img src="https://github.com/jsricarde/jsnad-labs/raw/master/buffers/imgs/buffer-13.png" width="800" />
  <br />
</p>
