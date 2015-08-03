var log = require('coyno-log');

var AddressUpdater = require('./index.js');

var addressUpdater = new AddressUpdater();

addressUpdater.start(function(err) {
  if (err) {
    return log.error(err);
  }
  log.info('Address Updater started');
});
