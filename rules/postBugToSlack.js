var message = require('lambda-cfn').message;
var splitOnComma = require('lambda-cfn').splitOnComma;
var util = require('util');

module.exports.config = {
  name: 'postBugToSlack',
  sourcePath: 'rules/postBugToSlack.js',
  gatewayRule: {
    method: 'POST',
    apiKey: false
  }
};

module.exports.postBugToSlack = function (event, callback) {
    if (event.zen != undefined) {
        var ping = 'GitHub ping event received';
        return callback(null, ping);
    } else {
        var notification = {
            subject: (util.format('`good-starter-bug`: In %s by %s', event.repository.name, event.issue.user.login)).substring(0,100),
            summary: util.format('%s applied `good-starter-bug` label on %s', event.issue.user.login, event.issue.html_url),
            event: event
        };
        message(notification, function(err, result) {
            if(err) console.log('error ', err);
            return callback(err, result);
        });
    }
};