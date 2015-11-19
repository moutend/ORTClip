import pg from 'pg';

function log(...message) {
  process.stdout.write(message.join(' ') + '\n');
}

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

const SQL = [
  "INSERT INTO message_table",
  "(hash, isUsing, message, timestamp)",
  "VALUES",
  "('',   FALSE,   '',      clock_timestamp());"
].join(' ');

for(let n = 1; n < 10000; n++) {
  (() => {
    sendSQL(SQL)
    .then((result) => {
      log(n, result);
    })
    .catch((error) => {
      log(error);
    });
  })(n);
}

log(SQL);
