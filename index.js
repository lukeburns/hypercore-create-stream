var duplexify = require('duplexify')
var memdb = require('memdb')
var hypercore = require('hypercore')

module.exports = function createStream (key, opts) {
  if (typeof key === 'string') key = Buffer(key, 'hex')
  if (key && !Buffer.isBuffer(key)) {
    opts = key
    key = undefined
  }
  if (!opts) opts = {}
  key = key || opts.key

  // get public key from private key, if possible
  var secretKey = opts.secretKey
  if (key && key.length === 64) {
    secretKey = key
    key = undefined
  } 
  if (!key && secretKey) {
    key = secretKey.slice(32, 64)
  }

  var db = opts.db || memdb()
  var core = hypercore(db)
  var feed = core.createFeed(null, { 
    key, 
    secretKey, 
    live: opts.live || !opts.static, 
    storage: opts.storage 
  })

  var read = !!key
  var write = !key || !!secretKey
  var stream, swarm

  if (read) {
    var rs = feed.createReadStream({ 
      live: !!opts.tail,
      start: opts.start,
      end: opts.end
    })
  }

  if (write) {
    var ws = feed.createWriteStream()
  }

  if (read && write) {
    stream = patch(duplexify(ws, rs), feed)
  } else {
    stream = rs || ws
  }

  return stream;
}

function patch (stream, feed) {
  stream.feed = feed
  stream.key = feed.key
  stream.secretKey = feed.secretKey
  stream.discoveryKey = feed.discoveryKey
  stream.live = feed.live
  return stream
}