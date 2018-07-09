const Chatbot = require('../lib/chatbot')
const expect = require('chai').expect

const contactId = 'contactId'
const key = 'key'

const chatbot = new Chatbot()

describe('Chatbot', () => {

  describe('setInterceptors()', () => {

    it('it accepts only an array', () => {
      try{
        chatbot.setInterceptors(1)
        expect.fail()
      } catch(err){
        expect(err.message).to.eql(`interceptors must be of type Array. It was 1.`)
      }
    })

    it('all array items must contain `before` and `after`', () => {
      // TODO
    })

    it('it sets interceptor', () => {

    })

  })

})
