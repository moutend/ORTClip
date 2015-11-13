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

function sendMessage(options, ws) {
  return function (event) {
    if(!options.message && !options.hash) {
      return;
    }

    const HASH = options.hash || createHash(8);
    const MODE = options.hash ? 'GET' : 'SET';
    const DATA = [MODE, HASH, options.message].join(' ');


    document.querySelector("#hidden_hash").value = HASH;
    ws.send(DATA);
  };
}

function recieveMessage(options, ws) {
  return function(event) {
    var response = event.data;

    if(!options.hash) {
      const id = parseInt(response);

      if(id < 0) {
        response = "Please wait...";
        setTimeout(sendMessage(options, ws), 10000);
      }
      else {
        const HASH = document.querySelector("#hidden_hash").value;
        response = zeroFill(response) + HASH;
      }
    }

    document.querySelector("#uri").innerHTML = response;
    document.querySelector("#send_screen").style.display = "none";
    document.querySelector("#sent_screen").style.display = "block";
  }
}

function foo() {
  var options = {
    hash:    null,
    message: null
  }

  if(window.location.hash === "") {
    options.message = document.querySelector("#textarea_message").value;
  }
  else {
    const URI_HASH = window.location.hash.slice(1);

    options.message = parseInt(URI_HASH.slice(0, 4));
    options.hash    = URI_HASH.slice(4);
  }

  var websocket_uri = "wss://murmuring-mountain-5009.herokuapp.com";
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
    foo()
  }

  button_send.addEventListener("click", foo);
  button_clear.addEventListener("click", clear);
};
