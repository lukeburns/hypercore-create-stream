# hypercore-create-stream

Create a readable and/or writable stream of a hypercore feed.

## Usage 

### New Feed

```js
var createStream = require('hypercore-create-stream')
var stream = createStream()

stream.write('hello')
stream.write('world')

console.log('public key', stream.key.toString('hex'))
```

## API

#### `var stream = createStream([key], [options])`

`key` is either a public or private key. If it is a public key, then the stream will be readable only. If it is a private key, then the stream will be both readable and writable. If it is undefined, then the stream's public and private keys are given by `stream.key` and `stream.secretKey`.

All `options` are optional.

```js
{
  db: leveldb instance,
  key: buffer,
  secretKey: buffer,
  static: boolean,
  storage: object,
  tail: boolean,
  start: integer,
  end: integer
}
```