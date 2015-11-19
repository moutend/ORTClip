'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.log = log;
exports.error = error;

function log() {
  for (var _len = arguments.length, message = Array(_len), _key = 0; _key < _len; _key++) {
    message[_key] = arguments[_key];
  }

  process.stdout.write(message.join(' ') + '\n');
}

function error() {
  for (var _len2 = arguments.length, message = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    message[_key2] = arguments[_key2];
  }

  process.stderr.write(message.join(' ') + '\n');
}