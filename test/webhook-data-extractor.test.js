const WebhookDataExtractor = require('../lib/chatbot/webhook-data-extractor')
const expect = require('chai').expect

describe('WebhookDataExtractor', () => {

  const extractor = new WebhookDataExtractor()

  it('_getPostbackPayload() returns payload', () => {

    const payload = 'payload'
    const result = extractor._getPostbackPayload({
      data: {
        postback: {payload}
      }
    })
    expect(result).to.eql(payload)
  })

  it('_getContactId() returns contactId', () => {
    const contactId = 'contactId'
    const result = extractor._getContactId({
      data: {
        contact: {id: contactId}
      }
    })
    expect(result).to.eql(contactId)
  })

  it('_getChannelId() returns channelId', () => {
    const channelId = 'channelId'
    const result = extractor._getChannelId({
      data: {
        channel: {id: channelId}
      }
    })
    expect(result).to.eql(channelId)
  })

})