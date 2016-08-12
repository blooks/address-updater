'use strict'

var _ = require('lodash')
var async = require('async')
var mongo = require('@blooks/mongo')

var AddressUpdater = function (doc) {
  if (!(this instanceof AddressUpdater)) {
    return new AddressUpdater(doc)
  }
  return _.extend(this, doc)
}

AddressUpdater.prototype.update = function (addresses, callback) {
  async.eachLimit(addresses, 20, this.updateAddress, callback)
}

AddressUpdater.prototype.updateAddress = function (address, callback) {
  mongo.db.collection('transfers').find({
    $or: [
      {'details.inputs': {$elemMatch: {'nodeId': address._id}}},
      {'details.outputs': {$elemMatch: {'nodeId': address._id}}}
    ]
  }).toArray(function (err, transactions) {
    if (err) {
      return callback(err)
    }

    var balance = transactions.reduce(function (total, transaction) {
      return total -
        transaction.details.inputs.reduce(function (total, input) {
          return input.nodeId === address._id ? total + input.amount : total
        }, 0) +
        transaction.details.outputs.reduce(function (total, output) {
          return output.nodeId === address._id ? total + output.amount : total
        }, 0)
    }, 0)

    if (balance === address.balance) {
      return callback()
    }

    mongo.db.collection('bitcoinaddresses').update({_id: address._id}, {
      $set: {balance: balance}
    }, function (err) {
      callback(err)
    })
  })
}

module.exports = AddressUpdater
