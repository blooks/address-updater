'use strict'

var kue = require('kue')
var log = require('@blooks/log')
var Mongo = require('@blooks/mongo')
var AddressUpdater = require('./updater')

var loadAddresses = function ({addresses, userId, mongo}, callback) {
  return mongo.db.collection('bitcoinaddresses').find({
    address: { $in: addresses },
    userId: userId
  }).toArray(callback)
}

function addJobHandlers ({queue, mongo}) {
  queue.process('addresses.update', (job, done) => {
    if (!job.data.addresses) {
      log.error('Got job without addresses')
      return done('No addresses to work on.')
    }
    if (!job.data.userId) {
      log.error('Job without user id.')
      return done('Invalid User Id.')
    }
    var addressUpdater = new AddressUpdater({doc: { userId: job.data.userId }, mongo})

    log.info({ numAddresses: job.data.addresses.length }, 'Fetching transactions ')
    loadAddresses({addresses: job.data.addresses, userId: job.data.userId, mongo}, (err, addresses) => {
      if (err) {
        log.error('Mongo Error')
        return done(err)
      }
      if (addresses.length < 1) {
        log.warn('No addresses found')
        return done('No addresses found.')
      }
      addressUpdater.update(addresses, done)
    })
  })
}

class CoynoAddressUpdater {
  constructor (redisUrl, mongoUrl) {
    this.queue = kue.createQueue({
      redis: redisUrl
    })
    this.mongo = new Mongo(mongoUrl)
  }

  start (callback) {
    this.mongo.start((err) => {
      if (err) {
        return callback(err)
      }
      addJobHandlers({queue: this.queue, mongo: this.mongo})
      return callback()
    })
  }
}

module.exports = CoynoAddressUpdater