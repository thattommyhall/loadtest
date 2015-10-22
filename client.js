var request = require('request');
var WebSocket = require('ws');
var _ = require('lodash');
var helpers = require('./helpers');
var timestamp = helpers.timestamp;

var SERVER = process.env.SERVER || 'localhost'
var PORT = process.env.PORT || 8080;
var N = process.env.N || 2;

var connections = {};
var userCount = 0;

function connect() {
  var ws = new WebSocket('ws://' + SERVER + ':' + PORT);
  ws.messagecount = 0;

  ws.on('open', function open() {
    // console.log('connected')
    userCount++;
  });

  ws.on('message', function(data, flags) {
    data = JSON.parse(data);
    if (data.userName) {
      ws.userName = data.userName;
      connections[ws.userName] = ws;
      // console.log(ws.userName)
    }
    if (data.message) {
      ws.messagecount++;
      // console.log(data.message)
    }
  });
  return ws;
}

function start_connection() {
  var ws = connect();
  var handler = function(ws) {
    ws.on('error', function(err) {
      console.log(err);
      ws.close();
      delete connections[ws.userName];
      userCount--;
    });
  };
  handler(ws);
}


for (var i=0; i<N; i++) {
  (function(p) {
    setTimeout(function() {
      console.log("starting: " + p)
      for (var j=0; j<1000; j++) {
        start_connection();
      }
    }, p*3000);
  }(i));
}

function displayStats() {
  console.log('************');
  console.log(userCount);
}

setInterval(displayStats, 1000);
