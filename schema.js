var dynamoose = require('dynamoose');
var Schema = dynamoose.Schema;
var uuid = require('node-uuid').v4;
var helpers = require('./helpers');
timestamp = helpers.timestamp;

dynamoose.AWS.config.update({
  region: 'eu-west-1'
});

dynamoose.local();

var userSchema = new Schema({
  username: {
    hashKey: true,
    type: String,
  }
});

var User = dynamoose.model('Users', userSchema);
User.findOrCreate = function(username, callback) {
  User.query('username').eq(username).exec(function(err, users) {
    if (err) {
      callback(err);
    }
    else if (users.length > 1) {
      callback('Multiple Users for username');
    }
    else if (users.length === 0) {
      User.create({username: username}, callback);
    }
    else {
      callback(null, users[0]);
    }
  });
};

var conversationSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
    "default": uuid
  },
  name: {
    type: String,
    "default": function() {
      return this.id;
    }
  },
  participants: [String]
});

Conversation = dynamoose.model('Conversations', conversationSchema);

var postSchema = new Schema({
  conversation_id: {
    type: String,
    hashKey: true
  },
  timestamp: {
    type: Number,
    rangeKey: true,
    "default": timestamp
  },
  username: {
    type: String
  },
  content: {
    type: String
  }
});

Post = dynamoose.model('Posts', postSchema);

module.exports = {
  User: User,
  Conversation: Conversation,
  Post: Post,
  aws: dynamoose.AWS
};
