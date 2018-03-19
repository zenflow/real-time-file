const { promisify } = require('util')
const fs = require('fs')

const fsReadFile = promisify(fs.readFile)
const readFile = file => fsReadFile(file, 'utf8')
const writeFile = promisify(fs.writeFile)

module.exports = {
  readFile,
  writeFile,
}
