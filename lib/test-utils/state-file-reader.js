const checkIsDefined = require('../utils/preconditions').checkIsDefined
const csv = require('fast-csv')
const fs = require('fs')
const filePath = require('./tmp-file-path')

class StateFileReader {

  async loadTestedTransitions() {
    const transitions = []
    return new Promise((resolve, reject) => {
      csv.fromPath(filePath)
        .on('data', (data) => {
          transitions.push({
              from: data[0],
              to: data[1],
              isTested: data[2]
            }
          )
        })
        .on('end', () => {
          console.log(`Finished loading from file: ${filePath}`)
          resolve(transitions)
        })
        .on('error', (error) => {
          console.error(error)
          reject(error)
        })

    })
  }

}

function getName(state) {
  return state.constructor.name
}

module.exports = new StateFileReader()
