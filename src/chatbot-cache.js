const LruMap = require('collections/lru-map')
const last = require('ramda/src/last')
const debug = require('logzio-node-debug').debug('moneta-chatbot:chatbot-cache')
const has = require('ramda/src/has')
const CBuffer = require('CBuffer')

// TODO separate chatbot & contact cache; chatbot cache will be accessible only via methods in State or Chatbot
class ChatbotCache {

  constructor() {
    this.contacts = null
    this.reset()
  }

  reset() {
    this.contacts = new LruMap(null, 100)
  }

  set(contactId, key, value) {
    const contact = this._getContact(contactId)
    contact[key] = value
  }

  get(contactId, key, defaultValue = null){
    const contact = this._getContact(contactId)
    if(has(key, contact)) return contact[key]

    return defaultValue
  }

  setNextState(contactId, state) {
    debug(`setNextState - contact: ${contactId}, state: ${state ? state.constructor.name : null}`)
    const contact = this._getContact(contactId)
    contact._nextState = state
  }

  getNextState(contactId) {
    const contact = this._getContact(contactId)
    return contact._nextState
  }

  pushPastState(contactId, state) {
    debug(`pushState - contact: ${contactId}, state: ${state.constructor.name}`)
    const contact = this._getContact(contactId)
    contact._pastStates.push(state)
  }

  getLastState(contactId) {
    const contact = this._getContact(contactId)
    return last(contact._pastStates.toArray())
  }

  getPastStates(contactId) {
    const contact = this._getContact(contactId)
    return contact._pastStates.toArray()
  }

  _getContact(contactId) {
    const contact = this.contacts.get(contactId);
    if (contact) return contact

    const newContact = {
      _pastStates: new CBuffer(20),
    }

    this.contacts.set(contactId, newContact)
    return newContact
  }

}

module.exports = new ChatbotCache()
