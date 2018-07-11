const Interceptor = require('../lib/chatbot/interceptor')
const expect = require('chai').expect

describe('Interceptor', () => {

  it('_getContactId() returns contactId', () => {
    const interceptor = new Interceptor()
    const contactId = 'contactId'
    const result = interceptor._getContactId({
      data: {
        contact: {id: contactId}
      }
    })
    expect(result).to.eql(contactId)
  })

  it('_getChannelId() returns channelId', () => {
    const interceptor = new Interceptor()
    const channelId = 'channelId'
    const result = interceptor._getChannelId({
      data: {
        channel: {id: channelId}
      }
    })
    expect(result).to.eql(channelId)
  })

})