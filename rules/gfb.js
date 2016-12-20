'use strict';
var message = require('lambda-cfn').message;
var util = require('util');
var getEnv = require('lambda-cfn').getEnv;

module.exports.config = {
    name: 'gfb',
    sourcePath: 'rules/gfb.js',
    gatewayRule: {
        method: 'POST',
        apiKey: false
    },
    parameters: {
        bugLabel: {
            Type: 'String',
            Description: 'Name of the bug label'
        },
        slackChannel: {
            Type: 'String',
            Description: 'Name of the slack channel where bugs are to be posted eg.(#good-starter-bug)'
        },
        slackWebhookUrl: {
            Type: 'String',
            Description: 'Webhook URL of the slack channel'
        }
    }
};

module.exports.fn = function (event, callback) {
    if (event.zen != undefined) {
        var ping = 'GitHub ping event received';
        return callback(null, ping);
    } else {
        console.log('event ', event);
        if (event.action === 'labeled'){
            var label = event.label;
            if (label.name === getEnv('bugLabel')) {
                event["slackChannel"] = getEnv('slackChannel');
                event["Webhook"] = getEnv('slackWebhookUrl');
                var notification = {
                         subject: (util.format('`'+ getEnv('bugLabel') + '`: In %s by %s', event.repository.name, event.issue.user.login)).substring(0,100),
                         summary: '',
                         event: event
                };
                message(notification, function(err,result) {
                  if(err) console.log('error ', err);
                  console.log('result ', result);
                  return callback(err,result);
                });
            }
        } else {
            var badmsg = 'Error: unknown payload received';
            console.log(badmsg);
            return callback(badmsg);
        }
    }
};
