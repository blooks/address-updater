'use strict'

var _ = require('lodash')
var async = require('async')

const updateAddress = ({address, mongo}, callback) => {
  mongo.db.collection('transfers').find({
    $or: [
      { 'details.inputs': { $elemMatch: { 'nodeId': address._id } } },
      { 'details.outputs': { $elemMatch: { 'nodeId': address._id } } }
    ]
  }).toArray((err, transactions) => {
    if (err) {
      return callback(err)
    }

    var balance = transactions.reduce((total, transaction) => {
      return total -
        transaction.details.inputs.reduce((total, input) => {
          return input.nodeId === address._id ? total + input.amount : total
        }, 0) +
        transaction.details.outputs.reduce((total, output) => {
          return output.nodeId === address._id ? total + output.amount : total
        }, 0)
    }, 0)

    if (balance === address.balance) {
      return callback()
    }

    mongo.db.collection('bitcoinaddresses').update({ _id: address._id }, {
      $set: { balance: balance }
    }, callback)
  })
}

class AddressUpdater {
  constructor ({ doc, mongo }) {
    if (!(this instanceof AddressUpdater)) {
      return new AddressUpdater(doc)
    }
    this.mongo = mongo
    return _.extend(this, doc)
  }
  update (addresses, callback) {
    async.eachLimit(addresses, 20, (address, callback) => {
      return updateAddress({address, mongo: this.mongo}, callback)
    }, callback)
  }

}

module.exports = AddressUpdater
