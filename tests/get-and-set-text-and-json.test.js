/* eslint-env jest */

const tempy = require('tempy')
const path = require('path')
const RealTimeFile = require('../lib/index')
const { writeFile } = require('../lib/util')

test('get-and-set-text-and-json', async () => {
  const tempDir = tempy.directory()
  await writeFile(path.join(tempDir, 'foo.json'), JSON.stringify({ foo: 1 }))

  const file = new RealTimeFile(path.join(tempDir, 'foo.json'))
  let contentEventCount = 0
  let lastContent
  file.on('content', content => {
    contentEventCount++
    lastContent = content
  })

  {
    const [text, json] = await Promise.all([file.getText(), file.getJson()])
    expect(text).toEqual(`{"foo":1}`) // compact format
    expect(json).toEqual({ foo: 1 })
    expect(lastContent).toEqual(text)
    expect(contentEventCount).toEqual(1)
  }
  {
    await file.setJson({ bar: 2 })
    const [text, json] = await Promise.all([file.getText(), file.getJson()])
    expect(text).toEqual('{\n  "bar": 2\n}\n') // pretty format
    expect(json).toEqual({ bar: 2 })
    expect(lastContent).toEqual(text)
    expect(contentEventCount).toEqual(2)
  }
  {
    file.setJson({ foo: 1, bar: 2 }) // no `await` here
    expect(contentEventCount).toEqual(2) // event does not fire immediately
    const [text, json] = await Promise.all([file.getText(), file.getJson()])
    expect(text).toEqual('{\n  "foo": 1,\n  "bar": 2\n}\n') // pretty format
    expect(json).toEqual({ foo: 1, bar: 2 })
    expect(contentEventCount).toEqual(3)
  }

  file.stop()
})
