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

var getStream = function() {
  return new Promise(function(resolve, reject) {
    var isWebkit = typeof window.navigator.webkitGetUserMedia === 'function';
    var isMoz    = typeof window.navigator.mozGetUserMedia === 'function';

    if(isWebkit || isMoz) {
      window.navigator.getUserMedia = window.navigator.mozGetUserMedia || window.navigator.webkitGetUserMedia
    }

    window.navigator.getUserMedia(
      {
        video: true,
        audio: false
      },
      function(stream) {
        resolve(stream)
      },
      function(err) {
        reject(err)
      }
    )
  })
};

var streamToCanvas = function(stream) {
  return new Promise(function(resolve, reject) {
    var video  = _$('#video')[0]
    var canvas = _$('#qr-canvas')[0];
    var gc     = canvas.getContext('2d');
    gc.clearRect(0, 0, 256, 192);

    window.URL = URL || webkitURL;

    if(video.mozSrcObject) {
      video.mozSrcObject = stream;
    }
    else if(window.URL) {
      video.src = URL.createObjectURL(stream);
    }
    else {
      video.src = window.webkitURL.createObjectURL(stream);
    }

    video.play();

    resolve({
      gc: gc,
      video: video
    });
  })
};

var capture = function(option) {
  var video = option.video;
  var gc = option.gc;
  var tid = null;
  var interval = 200;

  try{
    gc.drawImage(video, 0, 0, 256, 192);

    try{
      var code = qrcode.decode();

      _$('#scan_screen textarea')[0].value = code;
      video.pause();


      handle({
        name: '#wait_screen'
      });
    }
    catch(e){
      tid = setTimeout(function() {
        capture(option);
      }, interval);
    };
  }
  catch(e){
    tid = setTimeout(function() {
      capture(option);
    }, interval);
  };

  handle({
    state: {
      tid: tid
    }
  });
};

var clearCapture = function(screen) {
  clearTimeout(screen.state.tid);
  return screen;
};

var prepareScan = function(screen) {
  getStream()
  .then(streamToCanvas)
  .then(function(option) {
    capture(option);
  })
  .catch(function(error) {
    console.log(error)
    capture(error);
  });

  return screen;
};

var scanCode = function(screen) {
  var code = _$('#textarea_code')[0].value
  var onresponse = function(response) {
    _$('#textarea_response_message')[0].value = response.message;
    handle({
      name: '#get_screen'
    });
  }

  if(code === '') {
    screen.state.isSticky = true;
    return screen;
  }

  var id   = code.slice(0, 4);
  var hash = code.slice(4);

  createWebSocket({
    mode: 'GET',
    hash: hash,
    message: id,
    onresponse: onresponse
  });

  return screen;
};

var copyToClipboard = function(screen) {
  var t = _$(screen.name + ' textarea')[0];
  var ios = /iPad|iPhone|iPod/.test(navigator.platform);

  screen.state.isSticky = true;

  if(ios || typeof window.ontouchstart === 'object') {
    t.focus();
    t.selectionStart = 0;
    t.selectionEnd = t.value.length;
    return ;screen
  }

  try {
    t.select();
    document.execCommand('copy');

    if(document.selection) {
      document.selection.empty();
      return screen;
    }

    if(window.getSelection) {
      window.getSelection().removeAllRanges();
      return screen;
    }
  }
  catch(error) {
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
      handle({
        name: '#error_screen'
      });
      return;
    }

    request.onresponse(response, ws);
  }
};

var onTimeout = function(ws) {
  _$('#textarea_error')[0].value = 'Connection timed out';
  handle({
    name: '#error_screen'
  });
};

var createWebSocket = function(request) {
  var protocol = 'clip-protocol';
  var uri      = 'wss://ortclip.herokuapp.com';
  var ws       = new WebSocket(uri, protocol);

//  request.tid = setTimeout(onTimeout, 24000);

  ws.addEventListener('open',    onOpen(request, ws));
  ws.addEventListener('message', onMessage(request, ws));
};

var sendMessage = function(screen) {
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

      handle({
        name: '#send_screen'
      });
    };
  })(hash);

  if(message === '') {
    screen.state.isSticky = true;
    return screen;
  }

  createWebSocket({
    mode: 'SET',
    hash: hash,
    message: message,
    onresponse: onresponse
  });

  return screen;
};

var screens = {
  '#welcome_screen': {
    '#edit_screen': {},
    '#scan_screen': {
      fn: prepareScan
    }
  },
  '#edit_screen': {
    '#welcome_screen': {},
    '#wait_screen': {
      fn: sendMessage
    }
  },
  '#scan_screen': {
    '#welcome_screen': {
      fn: clearCapture,
    },
    '#wait_screen': {
      fn: scanCode
    }
  },
  '#wait_screen': {
    '#send_screen': {},
    '#get_screen': {},
    '#error_screen': {}
  },
  '#get_screen': {
    '#welcome_screen': {},
    'copy': {
      fn: copyToClipboard
    }
  },
  '#send_screen': {
    '#welcome_screen': {},
    'copy': {
      fn: copyToClipboard
    }
  },
  '#error_screen': {
    '#welcome_screen': {}
  }
};

var handle = (function(screens) {
  var _prev_screen = {
    name: '#welcome_screen',
    state: {}
  };

  return function(next_screen) {
    if(typeof next_screen.name === 'undefined') {
      next_screen.name = _prev_screen.name;
    }

    if(typeof next_screen.state === 'undefined') {
      next_screen.state = _prev_screen.state;
    }

    var s = screens[_prev_screen.name][next_screen.name] || {};

    if(typeof s.fn === 'function') {
      _prev_screen = s.fn(_prev_screen);
    }

    if(_prev_screen.state.isSticky) {
     _prev_screen.state.isSticky = false;
      return;
    }


    var prev = _$(_prev_screen.name)[0];
    var next = _$(next_screen.name)[0];

    prev.style.display = "none";
    prev.className = prev.className.replace(/ animate-fade-in/g, '');
    next.style.display = "block";
    next.className += " animate-fade-in";

    _prev_screen = next_screen;
  };
})(screens);

window.onload = function() {
  Array.prototype.map.call(
    _$('button'),
    function(button) {
      button.addEventListener('click', function() {
        handle({
          name: button.className
        });
      });
    }
  );
};
