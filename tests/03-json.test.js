/* eslint-env jest */

const tempy = require('tempy')
const path = require('path')
const RealTimeFile = require('../lib/index')
const { writeFile } = require('../lib/util')

test('json', async () => {
  const filePath = path.join(tempy.directory(), 'foo.json')
  await writeFile(filePath, JSON.stringify({ foo: 1 }))

  const file = new RealTimeFile(filePath)
  let contentEventCount = 0
  file.on('content', content => {
    contentEventCount++
  })

  // file.getJson
  expect(await file.getJson()).toEqual({ foo: 1 })
  expect(contentEventCount).toEqual(1)

  {
    // file.setJson
    file.setJson({ bar: 2 })
    expect(contentEventCount).toEqual(1)
    const [text, json] = await Promise.all([file.getText(), file.getJson()])
    expect(text).toEqual('{\n  "bar": 2\n}\n')
    expect(json).toEqual({ bar: 2 })
    expect(contentEventCount).toEqual(2)
  }
  {
    // external update
    await writeFile(filePath, JSON.stringify({ foo: 1, bar: 2 }))
    expect(contentEventCount).toEqual(2)
    await new Promise(resolve => setTimeout(resolve, 100))
    const [text, json] = await Promise.all([file.getText(), file.getJson()])
    expect(text).toEqual('{"foo":1,"bar":2}')
    expect(json).toEqual({ foo: 1, bar: 2 })
    expect(contentEventCount).toEqual(3)
  }

  file.stop()
})
