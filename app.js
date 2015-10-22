"use strict";

// require('newrelic');
var bodyParser = require('body-parser');
var server = require('http').createServer();
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ server: server });
var express = require('express');
var app = express();
var redis = require('redis');
var helpers = require('./helpers');
var timestamp = helpers.timestamp;
var _ = require('lodash');
var uuid = require('node-uuid').v4;

var WUBL = require('./wubl').WUBL

// var schema = require('./schema');
// var User = schema.User;
// var Post = schema.Post;
// var Conversation = schema.Conversation;

// var bugsnag = require("bugsnag");
// bugsnag.register("KEY");
// app.use(bugsnag.requestHandler);

var port = process.env.PORT || 8080;

var servername = uuid();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

// app.use(bugsnag.errorHandler);
app.use(function(err, req, res, next) {
  console.error('ERR:', err);
  console.error('STACK:', err.stack);
  res.status(500).send({error: 'Something went wrong.'});
});


var connections = {};
var numUsers = 0;
var messagecount = 0;

var start = timestamp();

var redisURL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// var sub = redis.createClient(redisURL);
// sub.subscribe('conversations');

// var pub = redis.createClient(redisURL);

app.post('/post', function (req, res) {
  var userName = req.body.userName;
  var message = req.body.message;
  var conversationId = req.body.conversationId;
});

app.get('/', function(req, res) {
  res.send('OK');
});

app.post('/join', function (req, res) {
  var userName = req.body.userName;
  var conversationId = req.body.conversationId;
});

app.post('/leave', function (req, res) {
  var username = req.body.username;
  var conversation_id = req.body.conversationId;
});

server.on('request', app);
server.listen(port, function () {
  console.log('Listening on ' + server.address().port);
});


wss.on('connection', function connection(ws) {
  numUsers++;
  ws.id = uuid();
  connections[ws.id] = ws;
  // console.log('added: ' + ws.id);
  ws.send(JSON.stringify({userName: ws.id}));

  ws.on('message', function incoming(message) {
  });

  ws.on('error', function(err) {
    console.log(err);
  });

  ws.on('close', function() {
    // console.log(ws.id + " left")
    numUsers--;
    delete connections[ws.id]
  });
});

setInterval(function() {
  _.forEach(connections, function(ws, id) {
    ws.send(JSON.stringify({ channel: 'poop',
                             message: WUBL
                           }
                           ));
  });
}, 1000);

setInterval(function() {
  console.log(servername + ': ' + numUsers);
}, 1000);
