import pg from 'pg';
import WebSocket from 'websocket';

function log(...message) {
  process.stdout.write(message.join(' ') + '\n');
}

function err(...message) {
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
      let connection = null;
      let response = {
        isOK: false,
        message: null
      };

      log('Connection from:', request.origin);

      try {
        connection = request.accept('clip-protocol', request.origin);
      }
      catch(error) {
        err('Refused:', request.origin, error);
        return;
      }

      connection.on('message', (message) => {
        if(message.type === 'utf8') {
          const TIMESTAMP  = parseInt(+new Date() / 1000);
          const TABLE_NAME = 'message_table';
          let request    = JSON.parse(message.utf8Data);

          if(request.message.length > 1000) {
            response.message = 'The message should be less than 1000 chars';
             log(response.message);
            connection.sendUTF(JSON.stringify(response));
            return;
          }

          log(request);

          request.message = request.message.replace(/\$/g, '_$');
          request.hash    = request.hash.replace(/\$/g, '_$');

          if(request.mode === 'SET') {
            const UPDATE_ROW = [
              `UPDATE ${TABLE_NAME} SET`,
              'isUsing = True,',
              `hash = $$${request.hash}$$,`,
              `timestamp = to_timestamp(${TIMESTAMP}),`,
              `message = $$${request.message}$$`,
              'WHERE id = (',
              `  SELECT id FROM ${TABLE_NAME}`,
              '  WHERE isUsing = False',
              `  OR timestamp < to_timestamp(${TIMESTAMP - 90}) LIMIT 1`,
              ')'
            ].join(' ');

            log(UPDATE_ROW)

            sendSQL(UPDATE_ROW)
            .then((result) => {
              if(result.rowCount === 0) {
                return null;
              }

              const SELECT_ID = [
                `SELECT id FROM ${TABLE_NAME}`,
                `WHERE hash = $$${request.hash}$$`,
                `AND message = $$${request.message}$$`,
                `AND isUsing = True`
              ].join(' ');

              log(SELECT_ID);

              return sendSQL(SELECT_ID);
            })
            .then((result) => {
              response.isOK = true;

              if(result === null) {
                response.message = 'Not found';
              }
              else {
                response.message = parseInt(result.rows[0].id);
              }

              connection.sendUTF(JSON.stringify(response));
            })
            .catch((error) => {
              err(error);
              response.message = error;
              connection.sendUTF(JSON.stringify(response));
            });

            return;
          }

          if(request.mode === 'GET') {
            const SELECT_MESSAGE = [
              `SELECT message FROM ${TABLE_NAME}`,
              `WHERE id = $$${request.message}$$`,
              `AND hash = $$${request.hash}$$`
            ].join(' ');

            log(SELECT_MESSAGE);

            sendSQL(SELECT_MESSAGE)
            .then((result) => {
              response.isOK = true;
              response.message = result.rows[0].message
                                 .toString()
                                 .replace(/_\$/g, '$');

              connection.sendUTF(JSON.stringify(response));
            })
            .catch((error) => {
              err(error);
              response.message = error;
              connection.sendUTF(JSON.stringify(response));
            });

            return;
          }
        }
        else {
          response.message = 'Invalid message type';
          log(response.message);
          connection.sendUTF(JSON.stringify(response));
        }
      });

      connection.on('close', (reasonCode, description) => {
        response.message = 'Client closed the connection';
        log(response.message, reasonCode, description);
      });
    });

    log('Server listen at port', PORT);
    server.listen(PORT);
  }
}
