const fileWriter = require('./state-file-writer')
const chatbotCache = require('../chatbot/chatbot-cache')
const expectStatesEqual = require('../../../test/util/state.test-utils').expectStatesEqual
const checkIsArray = require('../../utils/preconditions').checkIsArray

let _chatbot = null

function checkChatbotDefined() {
  if (!_chatbot) throw new Error('Chatbot must be set using `chatbotTester.withChatbot(chatbot)')
}

async function testTransition(stateFrom, expectedStates, channelId, contactId, webhookData) {
  checkIsArray(expectedStates, 'expectedStates')
  checkChatbotDefined()

  for(let i = 1; i < expectedStates.length; i++){
    fileWriter.addTestedTransition(expectedStates[i-1], expectedStates[i])
  }

  chatbotCache.pushPastState(contactId, stateFrom)
  await _chatbot.runNextState(channelId, contactId, webhookData)
  const states = chatbotCache.getPastStates(contactId)
  expectStatesEqual(states, expectedStates)
}

function withChatbot(chatbot) {
  _chatbot = chatbot
}

function resetChatbotCache() {
  chatbotCache.reset()
}

function prepareTestTransition() {
  return {
    fromState(state) {
      return {
        withData: (channelId, contactId, webhookData) => {
          return {
            expectVisitedStates: (expectedStates) => {
              return {
                start: async () => {
                  await testTransition(state, expectedStates, channelId, contactId, webhookData)
                }
              }
            }
          }
        }
      }
    }
  }
}

module.exports = {
  testTransition,
  withChatbot,
  prepareTestTransition,
  resetChatbotCache
}
