"use strict";

function zeroFill(n) {
  return n < 10
    ? "000" + n
    : n < 100
      ? "00" + n
      : n < 1000
        ? "0" + n
        : n;
}

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

function copyClipboard() {
  var textarea_recieve = document.querySelector('#textarea_recieve');
  textarea_recieve.select();

  try {
    document.execCommand('copy');

    if ( document.selection ) {
      document.selection.empty();
    }
    else if ( window.getSelection ) {
      window.getSelection().removeAllRanges();
    }
  }
  catch(error) {
    console.error(error);
  }
}

function sendMessage(options, ws) {
  return function (event) {
    if(!options.message && !options.hash) {
      return;
    }

    var HASH = options.hash || createHash(8);
    var MODE = options.hash ? 'GET' : 'SET';
    var DATA = [MODE, HASH, options.message].join(' ');

    document.querySelector("#hidden_hash").value = HASH;
    ws.send(DATA);
  };
}

function recieveMessage(options, ws) {
  return function(event) {
    var response = event.data;

    document.querySelector("#editMessage_screen").style.display = "none";

    var id = parseInt(response);

    if(!options.hash) {
      if(id < 0) {
        setTimeout(sendMessage(options, ws), 12000);
      }
      else {
        var HASH = document.querySelector("#hidden_hash").value;
        response = zeroFill(response) + HASH;
      }
    }

    if(options.isSender && id < 0) {
      document.querySelector("#sendingMessage_screen").style.display = "block";
      return;
    }

    if(!options.isSender) {
      document.querySelector("#textarea_recieve").value = response;
      document.querySelector("#recieveMessage_screen").style.display = "block";
      document.querySelector("#recieveMessage_screen").className += " animate-fade-in";
      return;
    }

    var base_url = window.location.href;
    var uri = base_url.replace(/^.*\/\//, '') + "#" + response;
    var qr = new QRCode(document.querySelector("#QRCode"), {
      text:   uri,
      text:   "http://jindo.dev.naver.com/collie",
      width:  160,
      height: 160
    });

    document.querySelector("#input_uri").value = uri;
    document.querySelector("#sendingMessage_screen").style.display = "none";
    document.querySelector("#sendMessage_screen").style.display = "block";
    document.querySelector("#sendMessage_screen").className += " animate-fade-in";
  }
}

function foo() {
  var options = {
    isSender: true,
    hash:     null,
    message:  null
  }

  if(window.location.hash === "") {
    options.message = document.querySelector("#textarea_message").value;
  }
  else {
    options.isSender = false;
    var URI_HASH = window.location.hash.slice(1);

    options.message = parseInt(URI_HASH.slice(0, 4));
    options.hash    = URI_HASH.slice(4);
  }

  var websocket_uri = "wss://ortclip.herokuapp.com";
  var ws = new WebSocket(websocket_uri, 'clip-protocol');
  ws.addEventListener("open",    sendMessage(options, ws));
  ws.addEventListener("message", recieveMessage(options, ws));
}

function clear() {
  document.querySelector("#textarea_message").value = "";
}

window.onload = function() {
  var button_send  = document.querySelector("#button_send");
  var button_clear = document.querySelector("#button_clear");

  if(window.location.hash) {
    setTimeout(function() {
      foo()
      document.querySelector("#welcome_screen").style.display = "none";
      document.querySelector("recieveMessage_screen").style.display = "block";
      document.querySelector("recieveMessage_screen").className += " animate-fade-in";
    }, 1000);
  }
  else {
    setTimeout(function() {
      document.querySelector("#welcome_screen").style.display = "none";
      document.querySelector("#editMessage_screen").style.display = "block";
      document.querySelector("#editMessage_screen").className += " animate-fade-in";
    }, 1000);
  }

  button_copy.addEventListener("click", copyClipboard);
  button_send.addEventListener("click", foo);
  button_clear.addEventListener("click", clear);
};
