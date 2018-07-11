const WebhookDataExtractor = require('../lib/chatbot/webhook-data-extractor')
const expect = require('chai').expect

describe('WebhookDataExtractor', () => {

  it('_getContactId() returns contactId', () => {
    const extractor = new WebhookDataExtractor()
    const contactId = 'contactId'
    const result = extractor._getContactId({
      data: {
        contact: {id: contactId}
      }
    })
    expect(result).to.eql(contactId)
  })

  it('_getChannelId() returns channelId', () => {
    const extractor = new WebhookDataExtractor()
    const channelId = 'channelId'
    const result = extractor._getChannelId({
      data: {
        channel: {id: channelId}
      }
    })
    expect(result).to.eql(channelId)
  })

})