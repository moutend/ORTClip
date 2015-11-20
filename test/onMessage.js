import assert    from 'power-assert';
import onMessage from '../src/websocket/onMessage';

class PSQL {
  constructor(result) {
    this.result = result;
  }
  send() {
    return new Promise((resolve) => {
      resolve(this.result);
    });
  }
}

describe('onMessage', () => {
  let connection = {
    sendUTF: () => {}
  };

  it('is foobar', () => {
    let psql = new PSQL({
      rowCount: 0
    });
    let handler = onMessage(connection, psql);
    let message = {
      type: 'binary'
    };

    assert('binary' === handler(message));
  });
});
