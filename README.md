# hypercore-stream

Create a hypercore stream from a public or private key.

```
npm install hypercore-stream
```

## Usage 

### Create stream from a secret key

```js
var createStream = require('hypercore-stream')
var signatures = require('sodium-signatures')

var keys = signatures.keyPair()
var stream = createStream(keys.secretKey)
stream.write('hello')
stream.once('data', function (block) {
  console.log(block.toString()) // hello
})
```

## API

#### `var stream = createStream([key], [options])`

`key` is either a public or private key. If it is a public key, then the stream will be readable only. If it is a private key, then the stream will be both readable and writable. If it is undefined, then a new feed is made and its public and private keys are given by `stream.key` and `stream.secretKey`.

All `options` are optional.

```js
{
  db: leveldb instance,
  static: boolean,
  storage: object,
  tail: boolean,
  start: integer,
  end: integer
}
```
