const isEmpty = require('ramda/src/isEmpty')
const debug = require('logzio-node-debug').debug('amio-chatbot-builder-js:state')
const checkIsDefined = require('../utils/preconditions').checkIsDefined
const path = require('ramda/src/path')


class Interceptor {

  async before(webhook) {
    const {channelId, contactId, data} = webhook
    throw new Error('before(webhook) must be implemented in a child state.')
  }

  async after(webhook) {
    const {channelId, contactId, data} = webhook
    throw new Error('before(webhook) must be implemented in a child state.')
  }

  _getChannelId(webhook) {
    return path(['data', 'channel', 'id'], webhook)
  }

  _getContactId(webhook) {
    return path(['data', 'contact', 'id'], webhook)
  }

}

module.exports = Interceptor
