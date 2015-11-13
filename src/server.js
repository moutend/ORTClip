import pg from 'pg';
import WebSocket from 'websocket';

function console_log(...message) {
  process.stdout.write(message.join(' ') + '\n');
}

function console_error(message) {
  process.stderr.write(message.join(' ') + '\n');
}

export default class Server {
  constructor(PORT) {
    let WebSocketServer = WebSocket.server;
    let http = require('http');
    let server = http.createServer((request, response) => {
      response.writeHead(403);
      response.end('403 Forbidden');
    });

    function sendSQL(query) {
      return new Promise((resolve, reject) => {
        pg.connect(process.env.DATABASE_URL, (error, client, done) => {
          if(error) {
            reject(error);
            return;
          }

          if(client === null) {
            reject('client is null');
            return;
          }

          client.query(query, (error, result) => {
            done();

            if(error) {
              reject(error);
            }
            else {
              resolve(result);
            }
          });
        });
      });
    }

    let ws = new WebSocketServer({
      httpServer: server,
      autoAcceptConnections: false
    });

    ws.on('request', (request) => {
      var connection = null;

      try {
        connection = request.accept('clip-protocol', request.origin);
      }
      catch(error) {
        console_error(error);
        return;
      }

      connection.on('message', (message) => {
        if(message.type === 'utf8') {
          const REQUEST_ARRAY = message.utf8Data.split(' ');
          const CODE          = REQUEST_ARRAY[0];
          const HASH          = REQUEST_ARRAY[1];
          const MESSAGE       = REQUEST_ARRAY[2];
          const TIMESTAMP     = parseInt(+new Date() / 1000);

          console_log(message.utf8Data);

          if(MESSAGE.length > 1000) {
            connection.sendUTF('ERR The message should be less than 1000 chars');
            return;
          }

          if(CODE === 'SET') {
            const QUERY = [
              'UPDATE test_table SET',
              'isUsing = True,',
              `hash = $$${HASH}$$,`,
              `timestamp = to_timestamp(${TIMESTAMP}),`,
              `message = $$${MESSAGE}$$`,
              'WHERE id = (',
              '  SELECT id FROM test_table',
              '  WHERE isUsing = False',
              `  OR timestamp < to_timestamp(${TIMESTAMP - 90}) LIMIT 1`,
              ')'
            ].join(' ');

            sendSQL(QUERY)
            .then((result) => {
              if(result.rowCount === 0) {
                return -1;
              }

              const Q = [
                'SELECT id FROM test_table',
                `WHERE hash = $$${HASH}$$`
              ].join(' ');

              return sendSQL(Q);
            })
            .then((result) => {
              if(result === -1) {
                connection.sendUTF(JSON.stringify(result));
                return;
              }

              connection.sendUTF(result.rows[0].id.toString());
            })
            .catch((error) => {
              console_error(error);
              connection.sendUTF('-1');
            })
          }

          if(CODE === 'GET') {
            const QUERY_FOR_GET = [
              'SELECT message FROM test_table',
              `WHERE id = $$${MESSAGE}$$ AND hash = $$${HASH}$$`
            ].join(' ');

            console_log(QUERY_FOR_GET);

            sendSQL(QUERY_FOR_GET)
            .then((result) => {
              connection.sendUTF(result.rows[0].message.toString());
            })
            .catch((error) => {
              console_log(error);
              connection.sendUTF('ERR Not found');
            });
          }
        }
        else {
          connection.sendUTF('ERR Invalid message');
        }
      });

      connection.on('close', (reasonCode, description) => {
        console_log(reasonCode, description);
        return;
      });
    });

    console_log('Server listen at port', PORT);
    server.listen(PORT);
  }
}
