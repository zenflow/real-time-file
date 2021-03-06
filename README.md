# real-time-file
live readable+writable representation of a file

[![Build Status](https://travis-ci.org/zenflow/real-time-file.svg?branch=master)](https://travis-ci.org/zenflow/real-time-file)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![npm version](https://badge.fury.io/js/real-time-file.svg)](https://www.npmjs.com/packages/real-time-file)
[![Dependencies Status](https://david-dm.org/zenflow/real-time-file.svg)](https://david-dm.org/zenflow/real-time-file)
[![Greenkeeper badge](https://badges.greenkeeper.io/zenflow/real-time-file.svg)](https://greenkeeper.io/)
[![semantic-release badge](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/zenflow/real-time-file/blob/master/CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Example

```js
const RealTimeFile = require('real-time-file')

const file = new RealTimeFile('.gitignore')
file.on('text', text => {})
file.on('lines', lines => {})
file.ready
  .then(() => {
    file.lines.unshift('package-lock.json')
    // or
    file.lines = ['package-lock.json', ...lines]
    // or
    file.text = `package-lock.json\n${file.text}`
  })
  .catch(console.error)
```

- saves new contents to file system immediately
- watches the file and reloads when changed by another process
