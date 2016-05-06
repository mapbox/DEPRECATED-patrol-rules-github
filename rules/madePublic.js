var message = require('lambda-cfn').message;
var splitOnComma = require('lambda-cfn').splitOnComma;
var util = require('util');

module.exports.config = {
  name: 'madePublic',
  sourcePath: 'rules/madePublic.js',
  gatewayRule: {
    method: 'POST',
    apiKey: false
  }
};

module.exports.fn = function(event,callback) {
  if (event.zen != undefined) {
    var ping = 'GitHub ping event received';
    console.log(ping);
    return callback(null, ping);
  } else {
    if (event.sender && event.repository && event.sender.login && event.repository.name) {
      var notif = {
        subject: (util.format('Private repository %s made public by %s', event.repository.name, event.sender.login)).substring(0,100),
        summary: util.format('The private repository %s was made by public by github user %s at %s\nRepo: %s\nUser: %s', event.repository.name,event.sender.login, event.repository.updated_at, event.repository.html_url, event.sender.html_url),
        event: event
      };
      message(notif, function(err,result) {
        console.log(JSON.stringify(notif));
        return callback(err,result);
        });
    } else {
      var badmsg = 'Error: unknown payload received';
      console.log(badmsg);
      return callback(badmsg);
    }
  }
};
