const fs = require('fs')
const EventEmitter = require('events')
const pEvent = require('p-event')
const debounce = require('debounce')
const { readFile, writeFile } = require('./util')

const DEBOUNCE_TIME = 100

class TextFile extends EventEmitter {
  _maybeEmit(text) {
    const oldText = this._text
    this._text = text
    if (text !== oldText) {
      this.emit('text', text)
      return true
    }
  }
  constructor(fileName) {
    super()
    this.fileName = fileName
    this._text = null
    this._stopped = false

    const check = eventType => {
      if (this._stopped) {
        return
      }
      readFile(this.fileName)
        .catch(
          error => (error.code === 'ENOENT' ? null : Promise.reject(error)),
        )
        .then(
          text => !this._stopped && this._maybeEmit(text),
          error => !this._stopped && this.emit('error', error),
        )
    }

    this._watcher = fs.watch(
      fileName,
      { encoding: 'utf8' },
      debounce(check, DEBOUNCE_TIME),
    )

    check()

    this.ready = pEvent(this, 'text').then(text => {})
  }
  get text() {
    return this._text
  }
  set text(text) {
    if (!this._stopped) {
      if (this._maybeEmit(text)) {
        this.ready = writeFile(this.fileName, text ? String(text) : '')
          .catch(error => {
            if (this._stopped) {
              return
            }
            this.emit('error', error)
          })
          .then(() => {})
      }
    }
  }
  stop() {
    if (!this._stopped) {
      this._stopped = true
      this._watcher.close()
    }
  }
}

module.exports = { TextFile }
