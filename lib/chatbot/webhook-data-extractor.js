const path = require('ramda/src/path')

class WebhookDataExtractor {

  _getChannelId(webhook) {
    return path(['data', 'channel', 'id'], webhook)
  }

  _getContactId(webhook) {
    return path(['data', 'contact', 'id'], webhook)
  }

}

module.exports = WebhookDataExtractor