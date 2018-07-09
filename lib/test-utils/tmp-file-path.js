if(process.env.STATE_TRANSITIONS_FILE) {
  module.exports = process.env.STATE_TRANSITIONS_FILE
} else {
  module.exports = './tmp-transitions-tested.csv'
}

