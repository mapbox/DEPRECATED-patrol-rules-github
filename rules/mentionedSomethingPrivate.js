var message = require('lambda-cfn').message;
var splitOnComma = require('lambda-cfn').splitOnComma;
var util = require('util');
var keypath = require('keypather')();
var jwtDecode = require('jwt-decode');

module.exports.config = {
  name: 'mentionedSomethingPrivate',
  sourcePath: 'rules/mentionedSomethingPrivate.js',
  gatewayRule: {
    method: 'POST',
    apiKey: false
  }
};

module.exports.fn = function(event,callback) {
  if (event.zen != undefined) {
    var ping = 'GitHub ping event received';
    return callback(null, ping);
  } else {
    var secretKeys = (keypath.get(event, 'comment.body') || '').match(/sk\.[\w\.\d]+/g);
    try {
      jwtDecode(secretKeys[0])
      message({
        subject: util.format('%s mentioned a private token on %s',
          keypath.get(event, 'comment.user.login'),
          keypath.get(event, 'repository.name')
        ).substring(0,100),
        summary: util.format('%s at %s mentioned a private token on %s',
          keypath.get(event, 'comment.user.login'),
          keypath.get(event, 'comment.html_url'),
          keypath.get(event, 'repository.name')),
        event: event
      }, function(err, result) {
        return callback(err, result);
      });
    } catch (e) {
      callback(null, 'A safe comment was posted');
    }
  }
};
