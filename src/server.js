import pg from 'pg';
import WebSocket from 'websocket';

function log(...message) {
  process.stdout.write(message.join(' ') + '\n');
}

function error(message) {
  process.stderr.write(message.join(' ') + '\n');
}

export default class Server {
  constructor(PORT) {
    let WebSocketServer = WebSocket.server;
    let http = require('http');
    let server = http.createServer((request, response) => {
      response.writeHead(403);
      response.end('<h1>403 Forbidden</h1>');
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
        log('Connection from:', request.origin);
        connection = request.accept('clip-protocol', request.origin);
      }
      catch(error) {
        error('Refused:', request.origin, error);
        return;
      }

      connection.on('message', (message) => {
        if(message.type === 'utf8') {
          const REQUEST_ARRAY = message.utf8Data.split(' ');
          const CODE          = REQUEST_ARRAY[0];
          const HASH          = REQUEST_ARRAY[1];
          const MESSAGE       = REQUEST_ARRAY[2];
          const TIMESTAMP     = parseInt(+new Date() / 1000);
          const TABLE_NAME    = 'message_table';

          if(MESSAGE.length > 1000) {
            log(request.origin, MESSAGE.length);
            log(request.origin, 'Refused');
            connection.sendUTF('ERR The message should be less than 1000 chars');
            return;
          }

          if(CODE === 'SET') {
            const UPDATE_ROW = [
              `UPDATE ${TABLE_NAME} SET`,
              'isUsing = True,',
              `hash = $$${HASH}$$,`,
              `timestamp = to_timestamp(${TIMESTAMP}),`,
              `message = $$${MESSAGE}$$`,
              'WHERE id = (',
              `  SELECT id FROM ${TABLE_NAME}`,
              '  WHERE isUsing = False',
              `  OR timestamp < to_timestamp(${TIMESTAMP - 90}) LIMIT 1`,
              ')'
            ].join(' ');

            sendSQL(UPDATE_ROW)
            .then((result) => {
              if(result.rowCount === 0) {
                return -1;
              }

              const GET_ID = [
                `SELECT id FROM ${TABLE_NAME}`,
                `WHERE hash = $$${HASH}$$`,
                `AND isUsing = True`
              ].join(' ');

              return sendSQL(GET_ID);
            })
            .then((result) => {
              if(result === -1) {
                connection.sendUTF(JSON.stringify(result));
                return;
              }

              connection.sendUTF(result.rows[0].id.toString());
            })
            .catch((error) => {
              error(error);
              connection.sendUTF('-1');
            })
          }

          if(CODE === 'GET') {
            const QUERY_FOR_GET = [
              `SELECT message FROM ${TABLE_NAME}`,
              `WHERE id = $escape$${MESSAGE}$escape$`,
              `AND hash = $escape$${HASH}$escape$`
            ].join(' ');

            log('Query is: ', QUERY_FOR_GET);

            sendSQL(QUERY_FOR_GET)
            .then((result) => {
              log('Result:', JSON.stringify(result.rows));
              connection.sendUTF(result.rows[0].message.toString());
            })
            .catch((error) => {
              log(error);
              connection.sendUTF('ERR Not found');
            });
          }
        }
        else {
          connection.sendUTF('ERR Invalid message');
        }
      });

      connection.on('close', (reasonCode, description) => {
        log(reasonCode, description);
        return;
      });
    });

    log('Server listen at port', PORT);
    server.listen(PORT);
  }
}
