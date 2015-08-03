'use strict';

var kue = require('coyno-kue');
var log = require('coyno-log');
var mongo = require('coyno-mongo');
var AddressUpdater = require('./updater');

var loadAddresses = function(addresses, userId, callback) {
    return mongo.db.collection('bitcoinaddresses').find({ address: {$in : addresses }, userId: userId }).toArray(callback);
};

var CoynoAddressUpdater = function() {

};

CoynoAddressUpdater.prototype.start = function(callback) {
  mongo.start(function (err) {
    if (err) {
      return callback(err);
    }
    kue.jobs.process('addresses.update', function (job, done) {
      if (!job.data.addresses) {
        log.error('Got job without addresses');
        return done('No addresses to work on.');
      }
      if (!job.data.userId) {
        log.error('Job without user id.');
        return done('Invalid User Id.');
      }
      var addressUpdater = new AddressUpdater({userId: job.data.userId});

      log.info({numAddresses: job.data.addresses.length}, 'Fetching transactions ');
      loadAddresses(job.data.addresses, job.data.userId, function (err, addresses) {
        if (err) {
          log.error('Mongo Error');
          return done(err);
        }
        else if (addresses.length < 1) {
          log.warn('No addresses found');
          return done('No addresses found.');
        }
        addressUpdater.update(addresses, done);
      });
    });
    callback();
  });
};

module.exports = CoynoAddressUpdater;
