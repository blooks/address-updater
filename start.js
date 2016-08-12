var log = require('@blooks/log')

var AddressUpdater = require('./index.js')

if (!process.env.REDIS_URL) {
  log.warn('No REDIS_URL set in environment. Defaulting to localhost.')
}
if (!process.env.REDIS_URL) {
  log.warn('No MONGO_URL set in environment. Defaulting to localhost.')
}
var redisUrl = process.env.REDIS_URL || 'redis://localhost'
var mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/blooks'

var addressUpdater = new AddressUpdater(redisUrl, mongoUrl)

addressUpdater.start(function (err) {
  if (err) {
    return log.error(err)
  }
  log.info('Address Updater started')
})
