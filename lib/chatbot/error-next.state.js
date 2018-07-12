const State = require('./state')
const debug = require('logzio-node-debug').debug('moneta-chatbot:state.' + require('path').basename(__filename))
const error = require('logzio-node-debug').debug('moneta-chatbot:state.' + require('path').basename(__filename) + ':error')

class ErrorNextState extends State {

  constructor(){
    super()
  }

  async execute(channelId, contactId, webhook) {
    const message = 'execute() - contact:' + contactId + ', ERROR: no suitable state found in state#findNextState(). Every state shall specify it\'s successors.';
    error(message)
  }

}

module.exports = ErrorNextState
