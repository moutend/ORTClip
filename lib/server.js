'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _websocket = require('websocket');

var _websocket2 = _interopRequireDefault(_websocket);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _psql = require('./psql');

var _psql2 = _interopRequireDefault(_psql);

var _util = require('./util');

var Util = _interopRequireWildcard(_util);

var _websocketOnMessage = require('./websocket/onMessage');

var _websocketOnMessage2 = _interopRequireDefault(_websocketOnMessage);

var _websocketOnClose = require('./websocket/onClose');

var _websocketOnClose2 = _interopRequireDefault(_websocketOnClose);

var Server = function Server(PORT) {
  _classCallCheck(this, Server);

  var WebSocketServer = _websocket2['default'].server;
  var server = _http2['default'].createServer(function (request, response) {
    response.writeHead(403);
    response.end('403 Forbidden');
  });
  var ws = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  ws.on('request', function (request) {
    var connection = null;

    try {
      Util.log('Connection from:', request.origin);
      connection = request.accept('clip-protocol', request.origin);
    } catch (error) {
      Util.error('Refused:', request.origin, error);
      return;
    }

    connection.on('message', (0, _websocketOnMessage2['default'])(connection, _psql2['default']));
    connection.on('close', (0, _websocketOnClose2['default'])());
  });

  server.listen(PORT);
  Util.log('Server listen at port', PORT);
};

exports['default'] = Server;
module.exports = exports['default'];