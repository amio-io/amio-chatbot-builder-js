const is = require('ramda/src/is')

module.exports = {
  checkIsDefined: function(value, name) {
    if(!value) throw new Error(`${name} must be defined. It was ${value}.`)
  },

  checkIsArray: function (value, name) {
    if(!is(Array, value)) throw new Error(`${name} must be of type Array. It was ${value}.`)
  }
}
