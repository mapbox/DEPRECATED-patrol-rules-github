var GitHubApi = require('github');
var message = require('@mapbox/lambda-cfn').message;
var splitOnComma = require('@mapbox/lambda-cfn').splitOnComma;
var AWS = require('aws-sdk');

module.exports.fn = function(event, context, callback) {

  var github = new GitHubApi({
    version: '3.0.0'
  });

  var githubToken = process.env.githubToken;
  var githubOrganization = process.env.githubOrganization;
  var allowedList = splitOnComma(process.env.allowedList);
  var membersArray = [];

  var githubQuery = {
    org: githubOrganization,
    page: 1,
    filter: '2fa_disabled'
  };

  function getMembers(query) {
    github.authenticate({
      type: 'token',
      token: githubToken
    });
    return new Promise((resolve, reject) => {
      github.orgs.getMembers(query)
        .then((res) => {
          var members = res;
          members.filter(function(member) {
            membersArray.push(member.login);
          });
          if (github.hasNextPage(res)) {
            if (query.page == undefined) {
              query.page = 1;
            }
            query.page = query.page + 1;
            getMembers(query);
          }
        })
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  }

  function notify() {
    if (!process.env.PatrolAlarmTopic) return Promise.reject(new Error('Missing ENV PatrolAlarmTopic'));
    let notif;

    const match = membersArray.filter(function(member){
      // returns members of Github organization who are **not** in the allowed list
      return !(allowedList.indexOf(member) > -1);
    });

    if (match.length === 0) return Promise.resolve(null, '2FA was not disabled on any Github accounts');
    if (match.length === 1) {
      notif = {
        subject: 'User ' + match[0] + ' has disabled 2FA on their Github account',
        summary: 'User ' + match[0] + ' has disabled 2FA on their Github account',
        event: match
      };
    }
    if (match.length > 1) {
      notif = {
        subject: 'Multiple users have disabled 2FA on their Github accounts',
        summary: 'The following users have disabled 2FA on their Github account:\n' + match.join('\n') + '\n',
        event: match
      };
    }

    const sns = new AWS.SNS({ region: 'us-east-1' });
    const message = {
      Subject: notif.subject,
      Message: notif.summary + '\n' + notif.event,
      TopicArn: process.env.PatrolAlarmTopic
    };
    return Promise.resolve(null);
    //    sns.publish(message).promise()
    //      .then(() => next(nullj))
    //      .catch((err) => next(err));
  }

  getMembers(githubQuery)
    .then((query) => notify(query))
    .then(() => callback())
    .catch((err) => {
      var notif = {
        subject: 'Error: Github 2FA check',
        summary: err
      };
      console.log(err);
      message(notif, function(err, result) {
        return callback(err, result);
      });
    });
};
