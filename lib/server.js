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

function console_log() {
  for (var _len = arguments.length, message = Array(_len), _key = 0; _key < _len; _key++) {
    message[_key] = arguments[_key];
  }

  process.stdout.write(message.join(' ') + '\n');
}

function console_error(message) {
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

    try {
      connection = request.accept('clip-protocol', request.origin);
    } catch (error) {
      console_error(error);
      return;
    }

    connection.on('message', function (message) {
      if (message.type === 'utf8') {
        var _ret = (function () {
          var REQUEST_ARRAY = message.utf8Data.split(' ');
          var CODE = REQUEST_ARRAY[0];
          var HASH = REQUEST_ARRAY[1];
          var MESSAGE = REQUEST_ARRAY[2];
          var TIMESTAMP = parseInt(+new Date() / 1000);
          var table_name = 'MESSAGE_TABLE';

          console_log(message.utf8Data);

          if (MESSAGE.length > 1000) {
            connection.sendUTF('ERR The message should be less than 1000 chars');
            return {
              v: undefined
            };
          }

          if (CODE === 'SET') {
            var QUERY = ['UPDATE ' + TABLE_NAME + ' SET', 'isUsing = True,', 'hash = $$' + HASH + '$$,', 'timestamp = to_timestamp(' + TIMESTAMP + '),', 'message = $$' + MESSAGE + '$$', 'WHERE id = (', '  SELECT id FROM ' + TABLE_NAME, '  WHERE isUsing = False', '  OR timestamp < to_timestamp(' + (TIMESTAMP - 90) + ') LIMIT 1', ')'].join(' ');

            sendSQL(QUERY).then(function (result) {
              if (result.rowCount === 0) {
                return -1;
              }

              var Q = ['SELECT id FROM ' + TABLE_NAME, 'WHERE hash = $$' + HASH + '$$'].join(' ');

              return sendSQL(Q);
            }).then(function (result) {
              if (result === -1) {
                connection.sendUTF(JSON.stringify(result));
                return;
              }

              connection.sendUTF(result.rows[0].id.toString());
            })['catch'](function (error) {
              console_error(error);
              connection.sendUTF('-1');
            });
          }

          if (CODE === 'GET') {
            var QUERY_FOR_GET = ['SELECT message FROM test_table', 'WHERE id = $$' + MESSAGE + '$$ AND hash = $$' + HASH + '$$'].join(' ');

            console_log(QUERY_FOR_GET);

            sendSQL(QUERY_FOR_GET).then(function (result) {
              connection.sendUTF(result.rows[0].message.toString());
            })['catch'](function (error) {
              console_log(error);
              connection.sendUTF('ERR Not found');
            });
          }
        })();

        if (typeof _ret === 'object') return _ret.v;
      } else {
        connection.sendUTF('ERR Invalid message');
      }
    });

    connection.on('close', function (reasonCode, description) {
      console_log(reasonCode, description);
      return;
    });
  });

  console_log('Server listen at port', PORT);
  server.listen(PORT);
};

exports['default'] = Server;
module.exports = exports['default'];