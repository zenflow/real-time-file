const fs = require('fs')
const EventEmitter = require('events')
const pEvent = require('p-event')
const debounce = require('debounce')
const { readFile, writeFile } = require('./util')

const DEBOUNCE_TIME = 100

class RealTimeFile extends EventEmitter {
  _resetContentPromise() {
    this._contentPromise = pEvent(this, 'content')
      .catch(error => {
        if (error.code === 'ENOENT') {
          return null
        } else {
          throw error
        }
      })
      .then(content => {
        this._text = content
        this._lines = undefined
        this._json = undefined
      })
  }

  constructor(fileName) {
    super()
    this.name = fileName
    this._text = undefined
    this._lines = undefined
    this._json = undefined
    this._stopped = false

    const check = eventType => {
      if (this._stopped) {
        return
      }
      this._resetContentPromise()
      readFile(this.name).then(
        content => {
          if (this._stopped) {
            return
          }
          this.emit('content', content)
        },
        error => this.emit('error', error),
      )
    }

    this._watcher = fs.watch(
      fileName,
      { encoding: 'utf8' },
      debounce(check, DEBOUNCE_TIME),
    )

    check()
  }

  async getText() {
    await this._contentPromise
    return this._text
  }

  async setText(text) {
    this._resetContentPromise()
    const contentPromise = this._contentPromise
    await writeFile(this.name, text)
    await contentPromise
  }

  async getLines() {
    await this._contentPromise
    if (typeof this._lines === 'undefined') {
      this._lines = this._text && this._text.split(/\r?\n/)
    }
    return this._lines
  }

  async setLines(lines) {
    this._resetContentPromise()
    const contentPromise = this._contentPromise
    await writeFile(this.name, lines.join('\n'))
    await contentPromise
  }

  async getJson() {
    await this._contentPromise
    if (typeof this._json === 'undefined') {
      this._lines = this._text && JSON.parse(this._text)
    }
    return this._lines
  }

  async setJson(json) {
    this._resetContentPromise()
    const contentPromise = this._contentPromise
    await writeFile(this.name, JSON.stringify(json, null, 2) + '\n')
    await contentPromise
  }

  stop() {
    this._stopped = true
    this._watcher.close()
  }
}

module.exports = RealTimeFile
