var message = require('lambda-cfn').message;
var splitOnComma = require('lambda-cfn').splitOnComma;
var util = require('util');

module.exports.config = {
  name: 'madePublic',
  sourcePath: 'rules/madePublic.js',
  snsRule: {}
};

module.exports.fn = function(event,callback) {
  var notif;
  if (event.sender.login && event.repository.name) {
    notif = {
      subject: (util.format('Private repository %s made public by %s', event.repository.name, event.sender.login)).substring(0,100),
      summary: util.format('The private repository %s was made by public by github user %s at %s\\n\\nRepo: %s\\n\\nUser: %s', event.repository.name,event.sender.login, event.repository.updated_at, event.repository.html_url, event.sender.html_url)
    };
  } else {
    notif = {
      subject: util.format('Error detected in Github made-repository-public webhook payload'),
      summary: util.format('Malformed payload from Github made-repository-public webhook, see https://developer.github.com/v3/activity/events/types/#publicevent\\n\\n %s', JSON.stringify(event))
    };
  }
  message(notif, function(err,result) {
    return callback(err,result);
  });
};
