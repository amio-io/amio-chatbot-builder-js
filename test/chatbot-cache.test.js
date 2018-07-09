const cache = require('../src/chatbot-cache')
const expect = require('chai').expect

const contactId = 'contactId'
const key = 'key'

describe('Chatbot Cache', () => {

  beforeEach(() => {
    cache.reset()
  })

  describe('setter & getter', () => {

    it('get() finds no value so return a default one', () => {
      const res1 = cache.get(contactId, key)
      expect(res1).to.eql(null)

      const defaultValue = 'we\'re pushing it!'
      const res2 = cache.get(contactId, key, defaultValue)
      expect(res2).to.eql(defaultValue)
    })

    it('get() return stored value', () => {
      const value = 1
      cache.set(contactId, key, value)
      const result = cache.get(contactId, key, 2)
      expect(result).to.eql(value)
    })

  })

})
