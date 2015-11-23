import * as Util from "../util"

export default function handleMessage(connection, psql) {
  return function(message) {
    const TIMESTAMP  = parseInt(+new Date() / 1000);
    const TABLE_NAME = 'message_table';

    let request = null;
    let response = {
      isOK: false,
      message: null
    };

    if(message.type === 'utf8') {
      try {
        Util.log(message.utf8Data);
        request = JSON.parse(message.utf8Data);
      }
      catch(error) {
        response.message = 'Failed to parse JSON';
        Util.log(response.message);
        connection.sendUTF(JSON.stringify(response));
        return null;
      }

      if(request.message.length > 1000) {
        response.message = 'The message should be less than 1000 chars';
        Util.log(response.message);
        connection.sendUTF(JSON.stringify(response));
        return null;
      }

      Util.log('Request is:', request.message, request.hash);

      request.message = request.message.toString().replace(/\$/g, '_$');
      request.hash    = request.hash.toString().replace(/\$/g, '_$');

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

        psql.send(UPDATE_ROW)
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

          return psql.send(SELECT_ID);
        })
        .then((result) => {
          response.isOK = true;

          if(result === null) {
            response.message = 'wait';
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

        return 'SET';
      }

      if(request.mode === 'GET') {
        request.message = parseInt(request.message);

        if(!request.message) {
          response.message = 'Failed to parse hash';
          Util.log(response.message);
          connection.sendUTF(JSON.stringify(response));
          return null;
        }

        const SELECT_MESSAGE = [
          `SELECT message FROM ${TABLE_NAME}`,
          `WHERE id = $$${request.message}$$`,
          `AND hash = $$${request.hash}$$`
        ].join(' ');

        Util.log(SELECT_MESSAGE);

        psql.send(SELECT_MESSAGE)
        .then((result) => {
          if(result.rowCount === 0) {
            response.message = 'Not found'
            connection.sendUTF(JSON.stringify(response));
            Util.log(response.message);
            return;
          }

          response.isOK = true;
          response.message = result.rows[0].message.replace(/_\$/g, '$');
          connection.sendUTF(JSON.stringify(response));
          Util.log(response.message);
        })
        .catch((error) => {
         Util.error(error);
          response.message = error;
          connection.sendUTF(JSON.stringify(response));
        });

        return 'GET';
      }
    }
    else {
      response.message = 'Invalid message type';
      Util.log(response.message);
      connection.sendUTF(JSON.stringify(response));
      return 'binary';
    }
  }
}
