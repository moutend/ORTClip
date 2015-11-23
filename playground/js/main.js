'use strict';

var _$ = function(querry) {
  return document.querySelectorAll(querry);
}
var createHash = function(length) {
  return new Array(length)
  .fill(0)
  .map(function() {
    return 33 + Math.random() * 78;
  })
  .map(function(v) {
    return String.fromCharCode(v);
  })
  .join('');
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
  var onresponse = function(response) {
    _$('#textarea_response_message')[0].value = response.message;
    handle('#get_screen');
  }

  if(code === '') {
    state.isRefused = true;
    return state;
  }

  var id   = code.slice(0, 4);
  var hash = code.slice(4);

  createWebSocket({
    mode: 'GET',
    hash: hash,
    message: id,
    onresponse: onresponse
  });

  return state;
};

var copyToClipboard = function(state) {
  var t = _$(state.currentScreenName+ ' textarea')[0];
  var ios = /iPad|iPhone|iPod/.test(navigator.platform);

  state.isRefused = true;

  if(ios || typeof window.ontouchstart === 'object') {
    t.focus();
    t.selectionStart = 0;
    t.selectionEnd = t.value.length;
    return state;
  }

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

  return state;
};

var onOpen= function(options, ws) {
  return function (event) {
    clearTimeout(options.tid);
    ws.send(JSON.stringify(options));
  };
};

var onMessage = function(request, ws) {
  return function(event) {
    var response = JSON.parse(event.data.toString());

    ws.close();

    if(!response.isOK) {
      _$('#textarea_error')[0].value = JSON.stringify(response.message);
      handle('#error_screen');
      return;
    }

    request.onresponse(response, ws);
  }
};

var closeWebSocket = function(options, ws) {
  _$('#textarea_error')[0].value = 'Connection closed';
  handle('#error_screen');
};

var onTimeout = function(ws) {
  _$('#textarea_error')[0].value = 'Connection timed out';
  handle('#error_screen');
};

var createWebSocket = function(request) {
  var protocol = 'clip-protocol';
  var uri      = 'wss://ortclip.herokuapp.com';
  var ws       = new WebSocket(uri, protocol);

  request.tid = setTimeout(onTimeout, 24000);

  ws.addEventListener('close',   closeWebSocket(request, ws));
  ws.addEventListener('open',    onOpen(request, ws));
  ws.addEventListener('message', onMessage(request, ws));
};

var sendMessage = function(state) {
  var message = _$('#textarea_request_message')[0].value
  var hash    = createHash(8);
  var onresponse = (function(hash) {
    return function(response, ws) {
      if(response.message === "wait") {
        setTimeout(
          onMessage(options, ws),
          12000
        );
        return;
      }

      var text = zeroFill(parseInt(response.message)) + hash;
      _$('#textarea_qrcode')[0].value = text;
      _$("#image_qrcode")[0].innerHTML = '';

      var qrcode = new QRCode(_$("#image_qrcode")[0], {
        text:   text,
        width:  160,
        height: 160
      });

      handle('#send_screen');
    };
  })(hash);

  if(message === '') {
    state.isRefused = true;
    return state;
  }

  createWebSocket({
    mode: 'SET',
    hash: hash,
    message: message,
    onresponse: onresponse
  });

  return state;
};

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
      '#welcome_screen': {},
      '#wait_screen': sendMessage
    },
    '#scan_screen': {
      '#welcome_screen': {},
      '#wait_screen': scanCode
    },
    '#wait_screen': {
      '#send_screen': {},
      '#get_screen': {},
      '#error_screen': {}
    },
    '#get_screen': {
      '#welcome_screen': {},
      'copy': copyToClipboard
    },
    '#send_screen': {
      '#welcome_screen': {},
      'copy': copyToClipboard
    },
    '#error_screen': {
      '#welcome_screen': {}
    }
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
      _state.isRefused = false;
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
