var message = require('lambda-cfn').message;
var splitOnComma = require('lambda-cfn').splitOnComma;
var util = require('util');

module.exports.config = {
  name: 'goodStarterBug',
  sourcePath: 'rules/goodStarterBug.js',
  gatewayRule: {
    method: 'POST',
    apiKey: false
  }
};


module.exports.goodStarterBug = function(event,callback) {
 if (event.zen != undefined) {
      var ping = 'GitHub ping event received';
      return callback(null, ping);
 } else{
 	if (event.labels && event.action === 'labeled'){
 		event.labels.forEach(function(item,index){
 			if (item.name === 'good-starter-bug') {
 				console.log('good-starter-bug label present');
 				var notification = {
                 subject: (util.format('`good-starter-bug`: In %s by %s', event.repository.name, event.issue.user.login)).substring(0,100),
                 summary: util.format('%s applied `good-starter-bug` label on %s', event.issue.user.login, event.issue.html_url),
                 event: event
             };
            message(notification, function(err,result) {
              if(err) console.log('error ', err);
              return callback(err,result);
            });

 			}

 		});
 		
 	}

  }
};