'use strict';

var _$ = function(querry) {
  return document.querySelectorAll(querry);
};

var zeroFill = function(n) {
  return n < 10
    ? "000" + n
    : n < 100
      ? "00" + n
      : n < 1000
        ? "0" + n
        : n;
};

var scanCode = function(state) {
  var code = _$('#textarea_code')[0].value

  state.isRefused = false;

  if(code === '') {
    state.isRefused = true;
    return state;
  }

  var id   = code.slice(0, 4);
  var hash = code.slice(4);

  createWebSocket({
    mode: 'GET',
    hash: hash,
    message: id
  });

  return state;
};

var copyToClipboard = function(state) {
  var t = _$(state.currentScreenName+ ' textarea')[0];

  try {
    t.select();
    document.execCommand('copy');

    if ( document.selection ) {
      document.selection.empty();
    }
    else if ( window.getSelection ) {
      window.getSelection().removeAllRanges();
    }
  }
  catch(error) {
    handle('#error_screen');
  }

  state.isRefused = true;
  return state;
};

var messageWebSocket = function(options, ws) {
  return function(event) {
    var response = JSON.parse(event.data);

    if(response.isOK) {
      if(options.mode === 'SET' && response.message === '503') {
        setTimeout(
          messageWebSocket(options, ws),
          12000
        );
        return;
      }

      if(options.mode === 'GET') {
        _$('#textarea_response_message')[0].value = response.message;
        handle('#get_screen');
        return;
      }

      if(options.mode === 'SET') {
        var text = zeroFill(parseInt(response.message)) + options.hash;
        var qrcode = new QRCode(_$("#image_qrcode")[0], {
          text:   text,
          width:  160,
          height: 160
        });

        _$('#textarea_qrcode')[0].value = text;
        handle('#send_screen');
        return;
      }
    }
    else {
      _$('#textarea_error')[0].value = response.message;
      handle('#error_screen');
      return;
    }
  }
};

var openWebSocket= function(options, ws) {
  return function (event) {
    ws.send(JSON.stringify(options));
  };
};

var closeWebSocket = function(options, ws) {
  _$('#textarea_error')[0].value = 'Connection closed';
  handle('#error_screen');
};

var timeoutMessage = function(ws) {
  _$('#textarea_error')[0].value = 'Connection timed out';
  handle('#error_screen');
  return;
};

var createWebSocket = (function() {
  var _isOpened = false;

  return function(options) {
    if(_isOpened === true) {
      return;
    }

    _isOpened = true;

    setTimeout(
      timeoutMessage,
      24000
    );

    var protocol  = 'clip-protocol';
    var uri       = 'wss://ortclip.herokuapp.com';
    var ws        = new WebSocket(uri, protocol);

    ws.addEventListener('close',   closeWebSocket(options, ws));
    ws.addEventListener('open',    openWebSocket(options, ws));
    ws.addEventListener('message', messageWebSocket(options, ws));
  };
})();

var sendMessage = function(state) {
  var message = _$('#textarea_request_message')[0].value
  var hash    = createHash(8);

  state.isRefused = false;
  if(message === '') {
    state.isRefused = true;
    return state;
  }

  createWebSocket({
    mode: 'SET',
    hash: hash,
    message: message
  });

  return state;
};

function createHash(length) {
  return new Array(length)
  .fill(0)
  .map(function() {
    return 33 + Math.random() * 78;
  })
  .map(function(v) {
    return String.fromCharCode(v);
  })
  .join('');
}


function clearMessage(state) {
  _$(state.currentScreenName + ' textarea')[0].value = '';
  state.isRefused = true;
  return state;
}

var handle = (function() {
  var _state = {
    currentScreenName: '#welcome_screen',
    isRefused: false
  };
  var _screens = {
    '#welcome_screen': {
      '#edit_screen': {},
      '#scan_screen': {}
    },
    '#edit_screen': {
      '#wait_screen': sendMessage,
      'clearMessage': clearMessage
    },
    '#scan_screen': {
      '#wait_screen': scanCode
    },
    '#wait_screen': {
      '#send_screen': {},
      '#get_screen': {},
      '#error_screen': {}
    },
    '#get_screen': {
      'copy': copyToClipboard
    },
    '#send_screen': {
      'copy': copyToClipboard
    },
    '#error_screen': {}
  };

  return function(next_screen_name) {
    var screen = _screens[_state.currentScreenName][next_screen_name]

    if(typeof screen === 'undefined') {
      return;
    }

    if(typeof screen === 'function') {
      _state = screen(_state);
    }

    if(_state.isRefused) {
      return;
    }

    var prev = _$(_state.currentScreenName)[0];
    var next = _$(next_screen_name)[0];

    prev.style.display = "none";
    prev.className = prev.className.replace(/ animate-fade-in/g, '');
    next.style.display = "block";
    next.className += " animate-fade-in";

    _state.currentScreenName = next_screen_name;
  };
})();

window.onload = function() {
  Array.prototype.map.call(
    _$('button'),
    function(button) {
      button.addEventListener('click', function() {
        handle(button.className);
      });
    }
  );
};
