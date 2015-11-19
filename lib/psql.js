'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var PSQL = (function () {
  function PSQL() {
    _classCallCheck(this, PSQL);
  }

  _createClass(PSQL, [{
    key: 'send',
    value: function send(query) {
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
  }]);

  return PSQL;
})();

exports['default'] = PSQL;
module.exports = exports['default'];