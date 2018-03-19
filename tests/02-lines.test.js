/* eslint-env jest */

const tempy = require('tempy')
const path = require('path')
const RealTimeFile = require('../lib/index')
const { writeFile } = require('../lib/util')

test('lines', async () => {
  const filePath = path.join(tempy.directory(), 'foo.txt')
  await writeFile(filePath, 'INITIAL_FOO')

  const file = new RealTimeFile(filePath)
  let contentEventCount = 0
  file.on('content', content => contentEventCount++)

  // file.getLines
  expect(await file.getLines()).toEqual(['INITIAL_FOO'])
  expect(contentEventCount).toEqual(1)

  {
    // file.setLines
    file.setLines(['CHANGED_FOO', 'BAR'])
    expect(contentEventCount).toEqual(1)
    const [text, lines] = await Promise.all([file.getText(), file.getLines()])
    expect(text).toEqual('CHANGED_FOO\nBAR')
    expect(lines).toEqual(['CHANGED_FOO', 'BAR'])
    expect(contentEventCount).toEqual(2)
  }
  {
    // external update
    await writeFile(filePath, ['CHANGED_AGAIN_FOO', 'BAR', ''].join('\n'))
    expect(contentEventCount).toEqual(2)
    await new Promise(resolve => setTimeout(resolve, 100))
    const [text, lines] = await Promise.all([file.getText(), file.getLines()])
    expect(text).toEqual('CHANGED_AGAIN_FOO\nBAR\n')
    expect(lines).toEqual(['CHANGED_AGAIN_FOO', 'BAR', ''])
    expect(contentEventCount).toEqual(3)
  }

  file.stop()
})
