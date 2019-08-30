'use strict';
const github = require('@octokit/rest');
const message = require('@mapbox/lambda-cfn').message;
const splitOnComma = require('@mapbox/lambda-cfn').splitOnComma;
const AWS = require('aws-sdk');

module.exports.fn = async function() {

  const githubClient = github({
    version: '3.0.0',
    auth: `token ${process.env.githubToken}`
  });

  const githubOrganization = process.env.githubOrganization;
  const allowedList = splitOnComma(process.env.allowedList);
  const githubQuery = {
    org: githubOrganization,
    page: 1,
    filter: '2fa_disabled'
  };

  try {
    const listMembersOptions = githubClient.orgs.listMembers.endpoint.merge(githubQuery);
    const listMembersResponse = await githubClient.paginate(listMembersOptions);
    const memberLogins = listMembersResponse.map((member) => member.login);
    await notify(memberLogins);
  } catch (err) {
    const notif = {
      subject: 'Error: Github 2FA check',
      summary: err
    };
    console.log(err);
    message(notif, (err, result) => {
      if (err) {
        throw err;
      }
      return result;
    });
  }

  async function notify(members) {
    if (!process.env.PatrolAlarmTopic) return Promise.reject(new Error('Missing ENV PatrolAlarmTopic'));
    let notif;

    const match = members.filter((member) => {
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
