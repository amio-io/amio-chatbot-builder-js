const checkIsDefined = require('../utils/preconditions').checkIsDefined
const checkIsArray = require('../utils/preconditions').checkIsArray
const debug = require('logzio-node-debug').debug('amio-chatbot-builder-js:chatbot')
const error = require('logzio-node-debug').debug('amio-chatbot-builder-js:chatbot:error')
const chatbotCache = require('./chatbot-cache')
const path = require('ramda/src/path')


class Chatbot {

  constructor() {
    this.postbacks = []
    this.postbackKeyExtractor = postbackPayload => postbackPayload

    this.interceptors = []
    this.defaultPostbackState = null
    this.initialState = null
  }

  addInterceptor(interceptor) {
    checkIsDefined(interceptor.before, 'interceptor.before')
    checkIsDefined(interceptor.after, 'interceptor.after')
    this.interceptors.push(interceptor)
  }

  setInterceptors(interceptors){
    checkIsArray(interceptors, 'interceptors')
    interceptors.forEach((interceptor, i) => {
      checkIsDefined(interceptor.before, `interceptor[${i}].before`)
      checkIsDefined(interceptor.after, `interceptor[${i}].after`)
    })

    this.interceptors = interceptors
  }

  addPostback(key, state) {
    checkIsDefined(key, 'condition')
    checkIsDefined(state.execute, 'state.execute')

    this.postbacks[key] = state
  }

  setErrorPostbackState(state) {
    this.defaultPostbackState = state
  }

  setErrorNextState(state){
    // TODO how to implement it?
    // defaultStateHolder.set(state)
  }

  setInitialState(state) {
    this.initialState = state
  }

  setPostbackKeyExtractor(normalizerFunction) {
    this.postbackKeyExtractor = normalizerFunction
  }


   setNextState(contactId, nextState) {
    chatbotCache.setNextState(contactId, nextState)
  }



  // async runNextState(channelId, contactId, webhookData) {
  // noinspection UnterminatedStatementJS
  async runNextState(webhook) {
    const contactId = path(['data', 'contact', 'id'], webhook)
    if (!chatbotCache.getNextState(contactId)) {
      const nextState = await this._resolveNextStateFromLastState(webhook)
      // TODO nextState can be NULL; or again it can be a third default state; see state.findNextState
      chatbotCache.setNextState(contactId, nextState)
    }
    
    await this._runInterceptors(webhook, async () => {
      try {
        while (chatbotCache.getNextState(contactId)) {
          const nextState = chatbotCache.getNextState(contactId)
          chatbotCache.setNextState(contactId, null)
          chatbotCache.pushPastState(contactId, nextState)
          debug('runNextState() - new state: ', nextState ? nextState.constructor.name : null)

          const newNextState = await nextState.execute(webhook)
          chatbotCache.setNextState(contactId, newNextState)
        }
      } catch (err) {
        const lastState = chatbotCache.getLastState(contactId)
        error('lastState: ', lastState ? lastState.constructor.name : null, err)
      }
    })
  }

  async runPostback(webhook) {
    const contactId = path(['data', 'contact', 'id'], webhook)
    const payload = path(['data', 'postback', 'payload'], webhook)

    const postbackKey = this.postbackKeyExtractor(payload)
    const nextState = this.postbacks[postbackKey]

    if (nextState) chatbotCache.setNextState(contactId, nextState)
    else chatbotCache.setNextState(contactId, this.defaultPostbackState) // TODO this state should report error

    await this.runNextState(webhook)
  }

  async _runInterceptors(webhook, method) {
    try {
      let shallContinue
      for (const interceptor of this.interceptors) {
        shallContinue = await interceptor.before(webhook)
        if (!shallContinue) break
      }

      await method()
    } finally {
      for (const interceptor of this.interceptors) {
        interceptor.after(webhook)
      }
    }
  }

  async _resolveNextStateFromLastState(webhook) {
    const contactId = path(['data', 'contact', 'id'], webhook)
    const lastState = chatbotCache.getLastState(contactId)
    if (lastState) {
      debug('_resolveNextStateFromLastState() - last state: ', lastState ? lastState.constructor.name : null)
      return await lastState.findNextState(webhook, lastState)
    }

    if (this.initialState) return this.initialState

    throw new Error('initialState must be defined! It was ' + this.initialState)
  }
}

module.exports = Chatbot
