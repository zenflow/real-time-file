const arrayMutatorMethods = [
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'sort',
  'splice',
  'unshift',
]

function getTrappedArray(file) {
  class TrappedArray extends Array {}
  for (const key of arrayMutatorMethods) {
    TrappedArray.prototype[key] = function(...args) {
      const result = Array.prototype[key].apply(this, args)
      file.text = this.join('\n')
      return result
    }
  }
  return TrappedArray
}

module.exports = getTrappedArray
