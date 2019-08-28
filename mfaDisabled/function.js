var github = require('@octokit/rest');
var message = require('@mapbox/lambda-cfn').message;
var splitOnComma = require('@mapbox/lambda-cfn').splitOnComma;
var AWS = require('aws-sdk');

module.exports.fn = async function() {

  var githubClient = github({
    version: '3.0.0',
    auth: `token ${process.env.githubToken}`
  });

  var githubOrganization = process.env.githubOrganization;
  var allowedList = splitOnComma(process.env.allowedList);
  var membersArray = [];

  var githubQuery = {
    org: githubOrganization,
    page: 1,
    filter: '2fa_disabled'
  };

  try {
    const listMembersOptions = githubClient.orgs.listMembers.endpoint.merge(githubQuery);
    const listMembersResponse = await githubClient.paginate(listMembersOptions);
    listMembersResponse.filter((member) => {  // TODO: why filter?
      membersArray.push(member.login);
    });
    await notify();
  } catch (err) {
    var notif = {
      subject: 'Error: Github 2FA check',
      summary: err
    };
    console.log(err);
    message(notif, function(err, result) {
      if (err) {
        throw err;
      }
      return result;
    });
  }

  // TODO: is this okay here?
  async function notify() {
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
    return sns.publish(message).promise();
  }
};
