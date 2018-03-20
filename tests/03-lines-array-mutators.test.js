/* eslint-env jest */

const tempy = require('tempy')
const path = require('path')
const RealTimeFile = require('../lib/index')
const { writeFile, readFile } = require('../lib/util')

test('text', async () => {
  const filePath = path.join(tempy.directory(), 'foo.txt')
  await writeFile(filePath, 'initial')

  const file = new RealTimeFile(filePath)
  await file.ready
  expect(file.text).toEqual('initial')

  file.lines.push('pushed')
  expect(file.text).toEqual('initial\npushed')
  file.lines.unshift('unshifted')
  expect(file.text).toEqual('unshifted\ninitial\npushed')
  await file.ready
  expect(await readFile(filePath)).toEqual('unshifted\ninitial\npushed')

  file.lines = ['reset', '']
  expect(file.text).toEqual('reset\n')
  await file.ready
  expect(await readFile(filePath)).toEqual('reset\n')

  file.stop()
})
