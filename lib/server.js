'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var _websocket = require('websocket');

var _websocket2 = _interopRequireDefault(_websocket);

function log() {
  for (var _len = arguments.length, message = Array(_len), _key = 0; _key < _len; _key++) {
    message[_key] = arguments[_key];
  }

  process.stdout.write(message.join(' ') + '\n');
}

function err() {
  for (var _len2 = arguments.length, message = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    message[_key2] = arguments[_key2];
  }

  process.stderr.write(message.join(' ') + '\n');
}

var Server = function Server(PORT) {
  _classCallCheck(this, Server);

  var WebSocketServer = _websocket2['default'].server;
  var http = require('http');
  var server = http.createServer(function (request, response) {
    response.writeHead(403);
    response.end('<h1>403 Forbidden</h1>');
  });

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

  var ws = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  ws.on('request', function (request) {
    var connection = null;
    var response = {
      isOK: false,
      message: null
    };

    try {
      log('Connection from:', request.origin);
      connection = request.accept('clip-protocol', request.origin);
    } catch (error) {
      err('Refused:', request.origin, error);
      return;
    }

    connection.on('message', function (message) {
      if (message.type === 'utf8') {
        var _ret = (function () {
          var TIMESTAMP = parseInt(+new Date() / 1000);
          var TABLE_NAME = 'message_table';
          var request = JSON.parse(message.utf8Data);

          if (request.message.length > 1000) {
            response.message = 'The message should be less than 1000 chars';
            log(response.message);
            connection.sendUTF(JSON.stringify(response));
            return {
              v: undefined
            };
          }

          request.message = request.message.replace(/\$/g, '_$');
          request.hash = request.hash.replace(/\$/g, '_$');

          if (request.mode === 'SET') {
            var UPDATE_ROW = ['UPDATE ' + TABLE_NAME + ' SET', 'isUsing = True,', 'hash = $$' + request.hash + '$$,', 'timestamp = to_timestamp(' + TIMESTAMP + '),', 'message = $$' + request.message + '$$', 'WHERE id = (', '  SELECT id FROM ' + TABLE_NAME, '  WHERE isUsing = False', '  OR timestamp < to_timestamp(' + (TIMESTAMP - 90) + ') LIMIT 1', ')'].join(' ');

            log(UPDATE_ROW);

            sendSQL(UPDATE_ROW).then(function (result) {
              if (result.rowCount === 0) {
                return null;
              }

              var SELECT_ID = ['SELECT id FROM ' + TABLE_NAME, 'WHERE hash = $$' + request.hash + '$$', 'AND message = $$' + request.message + '$$', 'AND isUsing = True'].join(' ');

              log(SELECT_ID);

              return sendSQL(SELECT_ID);
            }).then(function (result) {
              response.isOK = true;

              if (result === null) {
                response.message = 'Not found';
              } else {
                response.message = parseInt(result.rows[0].id);
              }

              connection.sendUTF(JSON.stringify(response));
            })['catch'](function (error) {
              err(error);
              response.message = error;
              connection.sendUTF(JSON.stringify(response));
            });

            return {
              v: undefined
            };
          }

          if (request.mode === 'GET') {
            var SELECT_MESSAGE = ['SELECT message FROM ' + TABLE_NAME, 'WHERE id = $$' + request.message + '$$', 'AND hash = $$' + request.hash + '$$'].join(' ');

            log(SELECT_MESSAGE);

            sendSQL(SELECT_MESSAGE).then(function (result) {
              response.isOK = true;
              response.message = result.rows[0].message.toString().replace(/_\$/g, '$');

              connection.sendUTF(JSON.stringify(response));
            })['catch'](function (error) {
              err(error);
              response.message = error;
              connection.sendUTF(JSON.stringify(response));
            });

            return {
              v: undefined
            };
          }
        })();

        if (typeof _ret === 'object') return _ret.v;
      } else {
        response.message = 'Invalid message type';
        log(response.message);
        connection.sendUTF(JSON.stringify(response));
      }
    });

    connection.on('close', function (reasonCode, description) {
      response.message = 'Client closed the connection';
      log(response.message, reasonCode, description);
    });
  });

  log('Server listen at port', PORT);
  server.listen(PORT);
};

exports['default'] = Server;
module.exports = exports['default'];