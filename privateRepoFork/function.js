var message = require('@mapbox/lambda-cfn').message;
var util = require('util');

module.exports.fn = function(event, context, callback) {
  if (event.zen != undefined) {
    var ping = 'GitHub ping event received';
    console.log(ping);
    return callback(null, ping);
  } else {
    if (event.forkee && event.repository && event.repository.name && event.forkee.owner && event.forkee.owner.login) {
      if (event.repository.private) {
        var notif = {
          subject: (util.format('Private repository %s forked by %s', event.repository.name, event.forkee.owner.login)).substring(0,100),
          summary: util.format('The private repository %s was forked by github user %s at %s to forked repo %s\nSource repo: %s\nForked repo: %s\nUser: %s', event.repository.name, event.forkee.owner.login, event.forkee.updated_at, event.forkee.name, event.repository.html_url, event.forkee.html_url, event.forkee.owner.html_url),
          event: event
        };
        message(notif, function(err,result) {
          console.log(notif.subject + '\n' + notif.summary);
          return callback(err, result);
        });
      } else {
        var publicMsg = util.format('Public repository %s forked by %s', event.repository.name, event.forkee.owner.login);
        console.log(publicMsg);
        return callback(null, publicMsg);
      }
    } else {
      var badMsg = 'Error: unknown payload received';
      console.log(badMsg);
      return callback(badMsg);
    }
  }
};
