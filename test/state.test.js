const State = require('../lib/chatbot/state')
const ErrorNextState = require('../lib/chatbot/error-next.state')
const expect = require('chai').expect

describe('State', () => {

  describe('findNexState()', () => {

    it('falls back to a default error state', async () => {
        const state = new State()
        const nextState = await state.findNextState({
          data: {
            contact: {
              id: 'contactId'
            }
          }
        })

        expect(nextState).to.be.an.instanceOf(ErrorNextState)
    })

  })

})