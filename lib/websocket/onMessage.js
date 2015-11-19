'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = handleMessage;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _util = require("../util");

var Util = _interopRequireWildcard(_util);

function handleMessage(connection, psql) {
  return function (message) {
    var TIMESTAMP = parseInt(+new Date() / 1000);
    var TABLE_NAME = 'message_table';

    var response = {
      isOK: false,
      message: null
    };

    if (message.type === 'utf8') {
      var _ret = (function () {
        var request = JSON.parse(message.utf8Data);

        if (request.message.length > 1000) {
          response.message = 'The message should be less than 1000 chars';
          Util.log(response.message);
          connection.sendUTF(JSON.stringify(response));
          return {
            v: undefined
          };
        }

        Util.log('Request is:', request, message.utf8Data);

        request.message = request.message.replace(/\$/g, '_$');
        request.hash = request.hash.replace(/\$/g, '_$');

        if (request.mode === 'SET') {
          var UPDATE_ROW = ['UPDATE ' + TABLE_NAME + ' SET', 'isUsing = True,', 'hash = $$' + request.hash + '$$,', 'timestamp = to_timestamp(' + TIMESTAMP + '),', 'message = $$' + request.message + '$$', 'WHERE id = (', '  SELECT id FROM ' + TABLE_NAME, '  WHERE isUsing = False', '  OR timestamp < to_timestamp(' + (TIMESTAMP - 90) + ') LIMIT 1', ')'].join(' ');

          Util.log(UPDATE_ROW);

          psql.send(UPDATE_ROW).then(function (result) {
            if (result.rowCount === 0) {
              return null;
            }

            var SELECT_ID = ['SELECT id FROM ' + TABLE_NAME, 'WHERE hash = $$' + request.hash + '$$', 'AND message = $$' + request.message + '$$', 'AND isUsing = True'].join(' ');

            Util.log(SELECT_ID);

            return psql.send(SELECT_ID);
          }).then(function (result) {
            response.isOK = true;

            if (result === null) {
              response.message = 'Not found';
            } else {
              response.message = parseInt(result.rows[0].id);
            }

            connection.sendUTF(JSON.stringify(response));
          })['catch'](function (error) {
            Util.error(error);
            response.message = error;
            connection.sendUTF(JSON.stringify(response));
          });

          return {
            v: 'SET'
          };
        }

        if (request.mode === 'GET') {
          var SELECT_MESSAGE = ['SELECT message FROM ' + TABLE_NAME, 'WHERE id = $$' + request.message + '$$', 'AND hash = $$' + request.hash + '$$'].join(' ');

          Util.log(SELECT_MESSAGE);

          psql.send(SELECT_MESSAGE).then(function (result) {
            response.isOK = true;
            response.message = result.rows[0].message.toString().replace(/_\$/g, '$');

            connection.sendUTF(JSON.stringify(response));
          })['catch'](function (error) {
            Util.error(error);
            response.message = error;
            connection.sendUTF(JSON.stringify(response));
          });

          return {
            v: 'GET'
          };
        }
      })();

      if (typeof _ret === 'object') return _ret.v;
    } else {
      response.message = 'Invalid message type';
      Util.log(response.message);
      connection.sendUTF(JSON.stringify(response));
      return 'binary';
    }
  };
}

module.exports = exports['default'];