process.env.KEEP_FILE = true // this var is necessary to prevent ./tmp-transitions-tested.csv truncation at the beginning of analysis

// FIRST MOCK THE CLASSES then import other modules
const mockMock = require('mock-require')
const stateMock = require('./state.mock')
const pathToState = '../../chatbot-framework/state'
mockMock(pathToState, stateMock)
// END - FIRST MOCK THE CLASSES then import other modules
const walk = require('walk').walk
const stateFileReader = require('./state-file-reader')
const checkIsDefined = require('../../utils/preconditions').checkIsDefined
const is = require('ramda/src/is')

class ChatbotTestCollector {

  constructor(){
    this.transitions = []
  }

  async run(folderPath) {
    await this._importStates(folderPath)
    console.log('All transitions found:' + this._getNotTestedTransitions().length)

    const transitionsFromFile = await stateFileReader.loadTestedTransitions()
    transitionsFromFile.forEach(transition => {
      this._setTransitionTested(transition.from, transition.to, transition.isTested)
    })
    console.log('Not tested transitions found:' + this._getNotTestedTransitions().length)
    console.log(this._getNotTestedTransitions().map(t => t.from + ' → ' + t.to));
    if(this._getNotTestedTransitions().length > 0){
      console.log('You still need to test some state transitions')
      process.exit(this._getNotTestedTransitions().length)
    }

    console.log('🦀 HURRAYYY - chatbot seems healthy! 🦀')
  }

  async _importStates(folderPath){
    const statePaths = await this._getFilePathsToStates(__dirname + '/' + folderPath)
    for (const path of statePaths) {
      require(path)
    }
  }

  addTransition(stateFrom, stateTo){
    checkIsDefined(stateFrom, 'stateFrom')
    checkIsDefined(stateFrom.execute, 'stateFrom.execute')
    checkIsDefined(stateTo, 'stateTo')
    checkIsDefined(stateTo.execute, 'stateTo.execute')

    this.transitions.push({
        from: getName(stateFrom),
        to: getName(stateTo),
        isTested: false
      }
    )
  }

  _getNotTestedTransitions(){
    return this.transitions.filter(transition => !transition.isTested)
  }

  _setTransitionTested(stateFrom, stateTo, isTested){
    const index = this.transitions.findIndex(transition => {
      return transition.from === getName(stateFrom) && transition.to === getName(stateTo)
    })

    if(index === -1){
      console.log(`setTransitionTested() - Skipping transition ${stateFrom} → ${stateTo}`);
      return
    }

    this.transitions[index].isTested = isTested

  }

  async _getFilePathsToStates(folderPath) {
    console.log('Searching for states in ' + folderPath)

    return new Promise((resolve, reject) => {
      const statePaths = []
      const walker = walk(folderPath, {followLinks: false})

      walker.on('file', function (root, stat, next) {
        if (!stat.name.includes('state.js')) return next()

        const path = root.replace('\\', '/') + '/' + stat.name
        statePaths.push(path)
        next()
      });

      walker.on('end', function () {
        resolve(statePaths)
      })
    })
  }

}

function getName(state) {
  if(is(String, state)) return state

  return state.constructor.name
}


module.exports = new ChatbotTestCollector()
