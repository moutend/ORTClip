import WebSocket from 'websocket';
import http      from 'http';
import PSQL      from './psql';
import * as Util from './util';
import onMessage from './websocket/onMessage';
import onClose   from './websocket/onClose';

export default class Server {
  constructor(PORT) {
    let WebSocketServer = WebSocket.server;
    let server = http.createServer((request, response) => {
      response.writeHead(403);
      response.end('403 Forbidden');
    });
    let ws = new WebSocketServer({
      httpServer: server,
      autoAcceptConnections: false
    });

    ws.on('request', (request) => {
      let connection = null;

      try {
        Util.log('Connection from:', request.origin);
        connection = request.accept('clip-protocol', request.origin);
      }
      catch(error) {
        Util.error('Refused:', request.origin, error);
        return;
      }

      connection.on('message', onMessage(connection, PSQL));
      connection.on('close',   onClose());
    });

    server.listen(PORT);
    Util.log('Server listen at port', PORT);
  }
}
