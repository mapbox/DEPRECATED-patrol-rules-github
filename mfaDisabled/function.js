var GitHubApi = require('@octokit/rest');
var message = require('@mapbox/lambda-cfn').message;
var d3 = require('d3-queue');
var splitOnComma = require('@mapbox/lambda-cfn').splitOnComma;
var AWS = require('aws-sdk');

module.exports.fn = function(event, context, callback) {

  console.log('starting function');
  var github = new GitHubApi({
    version: '3.0.0',
    auth: `token ${process.env.githubToken}`
  });

  var githubOrganization = process.env.githubOrganization;
  var allowedList = splitOnComma(process.env.allowedList);
  var q = d3.queue(1);
  var membersArray = [];

  var githubQuery = {
    org: githubOrganization,
    page: 1,
    filter: '2fa_disabled'
  };


  console.log('set up github clients');

  function getMembers(query, next) {
    github.orgs.listMembers(query, function(err, res) {
      console.log('inside listMembers');
      console.log(err);
      callback(null);
      /**
      console.log(res);
      if (err) {
        return next(err);
      }
      var members = res;
      members.filter(function(member) {
        membersArray.push(member.login);
      });
      if (github.hasNextPage(res)) {
        if (query.page == undefined) {
          query.page = 1;
        }
        query.page = query.page + 1;
        getMembers(query, next);
      } else {
        return next();
      }

      **/
    });
  }

  function notify(next) {
    if (!process.env.PatrolAlarmTopic) return Promise.reject(new Error('Missing ENV PatrolAlarmTopic'));
    let notif;

    const match = membersArray.filter(function(member){
      // returns members of Github organization who are **not** in the allowed list
      return !(allowedList.indexOf(member) > -1);
    });

    if (match.length === 0) {
      console.log('2FA was not disabled on any Github accounts');
      return Promise.resolve({});
    }
    if (match.length === 1) {

      notif = {
        subject: 'User ' + match[0] + ' has disabled 2FA on their Github account',
        summary: 'User ' + match[0] + ' has disabled 2FA on their Github account',
        event: match
      };

      console.log(notif.subject);
    }
    if (match.length > 1) {
      notif = {
        subject: 'Multiple users have disabled 2FA on their Github accounts',
        summary: 'The following users have disabled 2FA on their Github account:\n' + match.join('\n') + '\n',
        event: match
      };
      console.log(notif.subject);
      console.log(notif.summary);
    }

    console.log('Notifying patrol alert of detected users...');
    const sns = new AWS.SNS({ region: 'us-east-1' });
    const message = {
      Subject: notif.subject,
      Message: notif.summary + '\n' + notif.event,
      TopicArn: process.env.PatrolAlarmTopic
    };
    sns.publish(message).promise()
      .then(() => next())
      .catch((err) => next(err));
  }

  q.defer(getMembers,githubQuery);
  q.defer(notify);
  q.awaitAll(function(err, res) {
    if (err) {
      var notif = {
        subject: 'Error: Github 2FA check',
        summary: err
      };
      console.log(err);
      message(notif, function(err, result) {
        return callback(err, result);
      });
    }
    console.log(res[1]);
    callback(err, res[1]);
  });
};
