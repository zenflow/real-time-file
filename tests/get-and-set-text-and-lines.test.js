/* eslint-env jest */

const tempy = require('tempy')
const path = require('path')
const RealTimeFile = require('../lib/index')
const { writeFile } = require('../lib/util')

test('get-and-set-text-and-lines', async () => {
  const tempDir = tempy.directory()
  await writeFile(path.join(tempDir, 'foo.txt'), 'INITIAL_FOO')

  const file = new RealTimeFile(path.join(tempDir, 'foo.txt'))
  let contentEventCount = 0
  let lastContent
  file.on('content', content => {
    contentEventCount++
    lastContent = content
  })

  {
    const [text, lines] = await Promise.all([file.getText(), file.getLines()])
    expect(text).toEqual('INITIAL_FOO')
    expect(lines).toEqual(['INITIAL_FOO'])
    expect(lastContent).toEqual(text)
    expect(contentEventCount).toEqual(1)
  }
  {
    await file.setText('CHANGED_FOO\nBAR')
    const [text, lines] = await Promise.all([file.getText(), file.getLines()])
    expect(text).toEqual('CHANGED_FOO\nBAR')
    expect(lines).toEqual(['CHANGED_FOO', 'BAR'])
    expect(lastContent).toEqual(text)
    expect(contentEventCount).toEqual(2)
  }
  {
    file.setLines(['CHANGED_AGAIN_FOO', 'BAR', '']) // no `await` here
    expect(contentEventCount).toEqual(2) // event does not fire immediately
    const [text, lines] = await Promise.all([file.getText(), file.getLines()])
    expect(text).toEqual('CHANGED_AGAIN_FOO\nBAR\n')
    expect(lines).toEqual(['CHANGED_AGAIN_FOO', 'BAR', ''])
    expect(contentEventCount).toEqual(3)
  }

  file.stop()
})
