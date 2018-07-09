const isEmpty = require('ramda/src/isEmpty')
const debug = require('logzio-node-debug').debug('amio-chatbot-builder-js:state')
const checkIsDefined = require('../utils/preconditions').checkIsDefined


class State {

  constructor() {
    this.nextStates = []
  }

  async execute(webhook) {
    const {channelId, contactId, data} = webhook
    throw new Error('execute() must be implemented in a child state.')
  }

  async findNextState(webhook, lastState) {
    const {channelId, contactId, data} = webhook
    debug(`findNextState - contact: ${contactId}`)
    for (const {state, condition} of this.nextStates) {
      debug(`findNextState - contact: ${contactId}, nextState: ${state.constructor.name}`)
      const canUseState = await condition(channelId, contactId, data, lastState)
      if (canUseState) return state
    }

    return require('../chatbot/states/default.state') // require() to prevent circular dependency
  }

  canTransitionToState(state) {
    return this.nextStates.includes(state)
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

  hasNextStates() {
    return !isEmpty(this.nextStates)
  }

  // noinspection JSUnusedLocalSymbols - keep signature
  async canUseThisState(webhookData, lastState = null) {
    throw new Error('canUseThisState() must be implemented in a child state.')
  }

}

module.exports = State
