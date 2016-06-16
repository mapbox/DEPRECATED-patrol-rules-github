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

module.exports.fn = function(event,callback) {
  if (event.zen != undefined) {
    console.log('event zen');
    var ping = 'GitHub ping event received';
    console.log(ping);
    return callback(null, ping);
  } else {
    console.log('event okay');
    if (event.forced && event.repository && event.pusher && event.ref.indexOf(event.repository.master_branch)) {
      var notif = {
        subject: (util.format('Force push on %s by %s', event.repository.name, event.pusher.name)).substring(0,100),
        summary: util.format('%s force pushed to %s', event.pusher.name, event.repository.name),
        event: event
      };
      message(notif, function(err,result) {
        if(err) console.log('error ', err);
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
