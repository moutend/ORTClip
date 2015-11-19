import pg from 'pg';

export default class PSQL {
  constructor() {

  }

  send(query) {
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
}
