class StateMock {

  addNextState(nextState, condition) {
    const transitionCollector = require('./chatbot-test-collector')
    transitionCollector.addTransition(this, nextState)
  }

}

module.exports = StateMock
