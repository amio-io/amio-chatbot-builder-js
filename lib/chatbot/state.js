const isEmpty = require('ramda/src/isEmpty')
const debug = require('logzio-node-debug').debug('amio-chatbot-builder-js:state')
const checkIsDefined = require('../utils/preconditions').checkIsDefined
const WebhookDataExtractor = require('./webhook-data-extractor')

class State extends WebhookDataExtractor {

  constructor() {
    super()
    this.nextStates = []
  }

  async execute(webhook) {
    const {channelId, contactId, data} = webhook
    throw new Error('execute() must be implemented in a child state.')
  }

  async findNextState(webhook) {
    const contactId = this._getContactId(webhook)
    debug(`findNextState - contact: ${contactId}`)
    for (const {state, condition} of this.nextStates) {
      debug(`findNextState - contact: ${contactId}, nextState: ${state.constructor.name}`)
      const canUseState = await condition(webhook)
      if (canUseState) return state
    }

    const ErrorNextState = require('./error-next.state') // prevents circular-dep
    return new ErrorNextState()
  }

  addNextState(nextState, condition) {
    checkIsDefined(nextState, 'nextState')
    checkIsDefined(nextState.execute, 'nextState.execute')
    checkIsDefined(condition, 'condition')

    this.nextStates.push({
      state: nextState,
      condition
    })
  }

}

module.exports = State
