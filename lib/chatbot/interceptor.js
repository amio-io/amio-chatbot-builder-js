const isEmpty = require('ramda/src/isEmpty')
const debug = require('logzio-node-debug').debug('amio-chatbot-builder-js:state')
const checkIsDefined = require('../utils/preconditions').checkIsDefined
const path = require('ramda/src/path')
const WebhookDataExtractor = require('./webhook-data-extractor')

class Interceptor extends WebhookDataExtractor {

  async before(webhook) {
    const {channelId, contactId, data} = webhook
    throw new Error('before(webhook) must be implemented in a child state.')
  }

  async after(webhook) {
    const {channelId, contactId, data} = webhook
    throw new Error('before(webhook) must be implemented in a child state.')
  }

}

module.exports = Interceptor
