/* eslint-env jest */

const tempy = require('tempy')
const path = require('path')
const RealTimeFile = require('../lib/index')
const { writeFile } = require('../lib/util')

test('text', async () => {
  const filePath = path.join(tempy.directory(), 'foo.txt')
  await writeFile(filePath, 'INITIAL_FOO')

  const file = new RealTimeFile(filePath)
  let contentEventCount = 0
  let lastContent
  file.on('content', content => {
    contentEventCount++
    lastContent = content
  })

  // file.getText()
  expect(await file.getText()).toEqual('INITIAL_FOO')
  expect(lastContent).toEqual('INITIAL_FOO')
  expect(contentEventCount).toEqual(1)

  // file.setText()
  file.setText('CHANGED_FOO\nBAR')
  expect(contentEventCount).toEqual(1)
  const [text, lines] = await Promise.all([file.getText(), file.getLines()])
  expect(text).toEqual('CHANGED_FOO\nBAR')
  expect(lines).toEqual(['CHANGED_FOO', 'BAR'])
  expect(lastContent).toEqual(text)
  expect(contentEventCount).toEqual(2)

  file.stop()
})
