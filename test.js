var createStream = require('./create-stream')
var signatures = require('sodium-signatures')
var tape = require('tape')

var keys = signatures.keyPair()

tape('creates readable stream given public key', function (t) {
  t.plan(3)
  var hypercore = require('hypercore')
  var level = require('level-party')
  var core = hypercore(level('./db'))

  var feed = core.createFeed()
  var block0 = 'hello'
  feed.append(block0)

  var stream = createStream(feed.key, { db: level('./db') })
  var readable = !!stream.read
  var writeable = !!stream.write

  t.ok(readable, 'stream is readable')
  t.ok(!writeable, 'stream is not writable')

  stream.once('data', function (block) {
    t.equal(block.toString(), block0, 'data appended to feed is written to stream')
  })
})

tape('creates live writeable stream given no key', function (t) {
  t.plan(4)

  var stream = createStream()
  var readable = !!stream.read
  var writeable = !!stream.write

  t.ok(!readable, 'stream is not readable')
  t.ok(writeable, 'stream is writable')

  var block0 = 'hello'
  stream.write(block0)
  stream.feed.get(0, function (err, block) {
    t.equal(block.toString(), block0, 'data written to stream is appended to feed')
    t.ok(stream.feed.live, 'feed is live')
  })
})

tape('creates static writeable stream given no key and static option', function (t) {
  t.plan(4)

  var stream = createStream({ static: true })
  var readable = !!stream.read
  var writeable = !!stream.write

  t.ok(!readable, 'stream is not readable')
  t.ok(writeable, 'stream is writable')

  var block0 = 'hello'
  stream.write(block0)
  stream.end()
  stream.on('finish', function () {
    stream.feed.get(0, function (err, block) {
      t.equal(block.toString(), block0, 'data written to stream is appended to feed')
      t.ok(!stream.feed.live, 'feed is static')
    })
  })
})

tape('creates readable and writable duplex stream given secret key', function (t) {
  t.plan(5)

  var stream = createStream(keys.secretKey, { tail: true })
  var readable = !!stream.read
  var writeable = !!stream.write

  t.ok(readable, 'stream is readable')
  t.ok(writeable, 'stream is writable')

  var block0 = 'hello'
  stream.write(block0)
  stream.feed.get(0, function (err, block) {
    t.equal(block.toString(), block0, 'data written to stream is appended to feed')

    var block1 = 'world'
    stream.feed.append(block1)
    stream.once('data', function (block) {
      t.equal(block.toString(), block1, 'data appended to feed is written to stream (w/ tailing enabled)')
    })
  })
  stream.once('data', function (block) {
    t.equal(block.toString(), block0, 'data written to stream is read from stream')
  })
})