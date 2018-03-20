/* eslint-env jest */

const tempy = require('tempy')
const path = require('path')
const RealTimeFile = require('../lib/index')
const { writeFile, readFile } = require('../lib/util')

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))

test('text', async () => {
  const filePath = path.join(tempy.directory(), 'foo.txt')
  await writeFile(filePath, 'initial')

  const file = new RealTimeFile(filePath)
  expect(file.lines).toEqual(null)
  expect(file.text).toEqual(null)

  // --- util ---
  let eventCount = 0
  let lastEventArg
  file.on('lines', lines => {
    eventCount++
    lastEventArg = lines
  })
  const eventCountFrom = async fn => {
    const initialEventCount = eventCount
    await fn()
    return eventCount - initialEventCount
  }
  // --- /util ---

  expect(
    await eventCountFrom(async () => {
      await file.ready
    }),
  ).toEqual(1)
  expect(lastEventArg).toEqual(['initial'])
  expect(file.lines).toEqual(['initial'])
  expect(file.text).toEqual('initial')

  expect(
    await eventCountFrom(() => {
      file.lines = ['prefix', ...file.lines, 'postfix']
    }),
  ).toEqual(1)
  expect(lastEventArg).toEqual(['prefix', 'initial', 'postfix'])
  expect(file.lines).toEqual(['prefix', 'initial', 'postfix'])
  expect(file.text).toEqual('prefix\ninitial\npostfix')

  await file.ready
  expect(await readFile(filePath)).toEqual('prefix\ninitial\npostfix')
  expect(lastEventArg).toEqual(['prefix', 'initial', 'postfix'])
  expect(file.lines).toEqual(['prefix', 'initial', 'postfix'])
  expect(file.text).toEqual('prefix\ninitial\npostfix')

  expect(
    await eventCountFrom(async () => {
      await writeFile(filePath, 'updated externally\n')
      await timeout(200)
    }),
  ).toEqual(1)
  expect(lastEventArg).toEqual(['updated externally', ''])
  expect(file.lines).toEqual(['updated externally', ''])
  expect(file.text).toEqual('updated externally\n')

  file.stop()
})
