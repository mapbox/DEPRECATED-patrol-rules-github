var GitHubApi = require('github');
var message = require('@mapbox/lambda-cfn').message;
var d3 = require('d3-queue');
var splitOnComma = require('@mapbox/lambda-cfn').splitOnComma;

module.exports.fn = function(event, context, callback) {

  var github = new GitHubApi({
    version: '3.0.0'
  });

  var githubToken = process.env.githubToken;
  var githubOrganization = process.env.githubOrganization;
  var allowedList = splitOnComma(process.env.allowedList);
  var q = d3.queue(1);
  var membersArray = [];

  var githubQuery = {
    org: githubOrganization,
    page: 1,
    filter: '2fa_disabled'
  };

  function getMembers(query, next) {
    github.authenticate({
      type: 'token',
      token: githubToken
    });
    github.orgs.getMembers(query, function(err, res) {
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
    });
  }

  function notify(next) {
    var notif;

    var match = membersArray.filter(function(member){
      // returns members of Github organization who are **not** in the allowed list
      return !(allowedList.indexOf(member) > -1);
    });

    if (match.length > 0) {
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
      message(notif, function(err, result) {
        if (err) return next(err);
        next(null, result);
      });
    } else {
      next(null, '2FA was not disabled on any Github accounts');
    }
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
