'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

function log() {
  for (var _len = arguments.length, message = Array(_len), _key = 0; _key < _len; _key++) {
    message[_key] = arguments[_key];
  }

  process.stdout.write(message.join(' ') + '\n');
}

function sendSQL(query) {
  return new Promise(function (resolve, reject) {
    _pg2['default'].connect(process.env.DATABASE_URL, function (error, client, done) {
      if (error) {
        reject(error);
        return;
      }

      if (client === null) {
        reject('client is null');
        return;
      }

      client.query(query, function (error, result) {
        done();

        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  });
}

var SQL = ["INSERT INTO message_table", "(hash, isUsing, message, timestamp)", "VALUES", "('',   FALSE,   '',      clock_timestamp());"].join(' ');

var _loop = function (n) {
  (function () {
    sendSQL(SQL).then(function (result) {
      log(n, result);
    })['catch'](function (error) {
      log(error);
    });
  })(n);
};

for (var n = 1; n < 10000; n++) {
  _loop(n);
}

log(SQL);