var log = require('@blooks/log').child({component: 'Address Updater Tests'})

var AddressUpdater = require('../index.js')

if (!process.env.REDIS_URL) {
  log.warn('No REDIS_URL set in environment. Defaulting to localhost.')
}

var redisUrl = process.env.REDIS_URL || 'redis://localhost'
var mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/blooks'

describe('Address Updater Tests', () => {
  describe('Start Stop Tests', () => {
    it('should start and stop', (done) => {
      var addressUpdater = new AddressUpdater(redisUrl, mongoUrl)
      addressUpdater.start(done)
    })
  })
})
