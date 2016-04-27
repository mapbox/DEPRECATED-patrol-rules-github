var message = require('lambda-cfn').message;
var splitOnComma = require('lambda-cfn').splitOnComma;
var util = require('util');

module.exports.config = {
  name: 'privateRepoFork',
  sourcePath: 'rules/privateRepoFork.js',
  gatewayRule: {
    method: 'POST',
    apiKey: true
  }
};

module.exports.fn = function(event,callback) {
  var notif;
  if (event.forkee.owner.login && event.repository.name) {
    if (event.repository.private) {
      notif = {
        subject: (util.format('Private repository %s forked by %s', event.repository.name, event.forkee.owner.login)).substring(0,100),
        summary: util.format('The private repository %s was forked by github user %s at %s to forked repo %s\\n\\nSource repo: %s\\n\\nForked repo: %s\\n\\nUser: %s', event.repository.name, event.forkee.owner.login, event.forkee.updated_at, event.forkee.name, event.repository.html_url, event.forkee.html_url, event.forkee.owner.html_url)
      };
    } else {
      return callback(null,util.format('Public repository %s forked by %s', event.repository.name, event.forkee.owner.login));
    }
  } else {
    notif = {
      subject: util.format('Error detected in Github private-repo-fork webhook payload'),
      summary: util.format('Malformed payload from Github private-repo-fork webhook, see https://developer.github.com/v3/activity/events/types/#forkevent\\n\\n %s', JSON.stringify(event))
    };
  }
  message(notif, function(err,result) {
    return callback(err,result);
  });
};
