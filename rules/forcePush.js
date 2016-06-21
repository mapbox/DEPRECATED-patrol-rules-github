var message = require('lambda-cfn').message;
var splitOnComma = require('lambda-cfn').splitOnComma;
var util = require('util');

module.exports.config = {
  name: 'forcePush',
  sourcePath: 'rules/forcePush.js',
  gatewayRule: {
    method: 'POST',
    apiKey: false
  }
};

module.exports.forcePush = function(event,callback) {
  if (event.zen != undefined) {
      var ping = 'GitHub ping event received';
      return callback(null, ping);
  } else {
      if (event.forced && event.repository && event.pusher && event.ref.indexOf(event.repository.master_branch) > -1) {
          var notification = {
              subject: (util.format('Force push on the %s branch of %s by %s', event.repository.name, event.repository.master_branch, event.pusher.name)).substring(0,100),
              summary: util.format('%s force pushed on %s branch to %s', event.pusher.name, event.repository.master_branch, event.repository.name),
              event: event
          };
          message(notification, function(err,result) {
              if(err) console.log('error ', err);
              return callback(err,result);
          });
      } else {
            if(event.forced && event.repository && event.pusher && event.ref.indexOf(event.repository.master_branch) === -1) {
                return callback(null,'Force push to a branch that is not master');
            }
            else {
                var badmsg = 'Error: unknown payload received';
                console.log(badmsg);
                return callback(badmsg);
            }
        }
    }
};
