import * as Util from "../util"

export default function handleMessage(connection, PSQL) {
  return function(message) {
    const TIMESTAMP  = parseInt(+new Date() / 1000);
    const TABLE_NAME = 'message_table';

    let response = {
      isOK: false,
      message: null
    };

    if(message.type === 'utf8') {
      let request    = JSON.parse(message.utf8Data);

      if(request.message.length > 1000) {
        response.message = 'The message should be less than 1000 chars';
        Util.log(response.message);
        this.connection.sendUTF(JSON.stringify(response));
        return;
      }

     Util.log('Request is:', request, message.utf8Data);

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

       Util.log(UPDATE_ROW)

        PSQL.send(UPDATE_ROW)
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

         Util.log(SELECT_ID);

          return PSQL.send(SELECT_ID);
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
         Util.error(error);
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

       Util.log(SELECT_MESSAGE);

        PSQL.send(SELECT_MESSAGE)
        .then((result) => {
          response.isOK = true;
          response.message = result.rows[0].message
                             .toString()
                             .replace(/_\$/g, '$');

          connection.sendUTF(JSON.stringify(response));
        })
        .catch((error) => {
         Util.error(error);
          response.message = error;
          connection.sendUTF(JSON.stringify(response));
        });

        return;
      }
    }
    else {
      response.message = 'Invalid message type';
      Util.log(response.message);
      connection.sendUTF(JSON.stringify(response));
    }
  }
}
