const checkIsDefined = require('../../utils/preconditions').checkIsDefined
const fs = require('fs')
const filePath = require('./tmp-file-path')

class StateFileWriter {

  constructor() {
    console.log('process.env.KEEP_FILE: ', process.env.KEEP_FILE)
    if(process.env.KEEP_FILE) return

    try {
      fs.writeFileSync(filePath, 'stateFrom, stateTo, isTested')
      console.log('File tmp-transitions-tested.csv exists: ', fs.existsSync(filePath))
    } catch (e) {
      console.log("Cannot write file ", e);
    }
  }

  addTestedTransition(stateFrom, stateTo) {
    checkIsDefined(stateFrom, 'stateFrom')
    checkIsDefined(stateFrom.execute, 'stateFrom.execute')
    checkIsDefined(stateTo, 'stateTo')
    checkIsDefined(stateTo.execute, 'stateTo.execute')

    const newLine = '\n' + getName(stateFrom) + ',' + getName(stateTo) + ',' + true
    try {
      fs.appendFileSync(filePath, newLine)
    } catch (e) {
      console.log("Cannot write file ", e);
    }
  }

}

function getName(state) {
  return state.constructor.name
}

module.exports = new StateFileWriter()
