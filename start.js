var log = require('coyno-log');

var AddressUpdater = require('./lib');

var addressUpdater = new AddressUpdater();

addressUpdater.start(function(err) {
  if (err) {
    return log.error(err);
  }
  log.debug('Address Updater started');
});
