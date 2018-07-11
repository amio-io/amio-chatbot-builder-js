const path = require('ramda/src/path')

class WebhookDataExtractor {

  _getChannelId(webhook) {
    return path(['data', 'channel', 'id'], webhook)
  }

  _getContactId(webhook) {
    return path(['data', 'contact', 'id'], webhook)
  }

  _getPostbackPayload(webhook) {
    return path(['data', 'postback', 'payload'], webhook)
  }

}

module.exports = WebhookDataExtractor