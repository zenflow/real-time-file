// TODO: flush method

const getTrappedArray = require('./getTrappedArray')

const withLines = TextFile => {
  return class LinesFile extends TextFile {
    constructor(fileName) {
      super(fileName)
      this._lines = null

      const TrappedArray = getTrappedArray(this)

      this.on('text', text => {
        const oldLines = this._lines
        this._lines = new TrappedArray(...text.split(/\r?\n/))
        if (JSON.stringify(this._lines) !== JSON.stringify(oldLines)) {
          this.emit('lines', this._lines)
        }
      })
    }
    get lines() {
      return this._lines
    }
    set lines(lines) {
      if (!this._stopped) {
        this.text = lines.join('\n')
      }
    }
  }
}

module.exports = { withLines }
