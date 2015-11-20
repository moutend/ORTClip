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

    var request = null;
    var response = {
      isOK: false,
      message: null
    };

    if (message.type === 'utf8') {
      try {
        Util.log(message.utf8Data);
        request = JSON.parse(message.utf8Data);
      } catch (error) {
        response.message = 'Failed to parse JSON';
        Util.log(response.message);
        connection.sendUTF(JSON.stringify(response));
        return null;
      }

      if (request.message.length > 1000) {
        response.message = 'The message should be less than 1000 chars';
        Util.log(response.message);
        connection.sendUTF(JSON.stringify(response));
        return null;
      }

      Util.log('Request is:', request.message, request.hash);

      request.message = request.message.toString().replace(/\$/g, '_$');
      request.hash = request.hash.toString().replace(/\$/g, '_$');

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

        return 'SET';
      }

      if (request.mode === 'GET') {
        request.message = parseInt(request.message);

        if (!request.message) {
          response.message = 'Failed to parse hash';
          Util.log(response.message);
          connection.sendUTF(JSON.stringify(response));
          return null;
        }

        var SELECT_MESSAGE = ['SELECT message FROM ' + TABLE_NAME, 'WHERE id = $$' + request.message + '$$', 'AND hash = $$' + request.hash + '$$'].join(' ');

        Util.log(SELECT_MESSAGE);

        psql.send(SELECT_MESSAGE).then(function (result) {
          if (result.rowCount === 0) {
            response.message = 'Not found';
            connection.sendUTF(JSON.stringify(response));
            Util.log(response.message);
            return;
          }

          response.isOK = true;
          response.message = result.rows[0].message.replace(/_\$/g, '$');
          connection.sendUTF(JSON.stringify(response));
          Util.log(response.message);
        })['catch'](function (error) {
          Util.error(error);
          response.message = error;
          connection.sendUTF(JSON.stringify(response));
        });

        return 'GET';
      }
    } else {
      response.message = 'Invalid message type';
      Util.log(response.message);
      connection.sendUTF(JSON.stringify(response));
      return 'binary';
    }
  };
}

module.exports = exports['default'];