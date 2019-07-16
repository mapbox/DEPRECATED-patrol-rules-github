var test = require('tape');
var nock = require('nock');
var AWS = require('@mapbox/mock-aws-sdk-js');

var rule = require('../mfaDisabled/function.js');
var fn = rule.fn;

process.env.githubOrganization = 'mapbox';
process.env.githubToken = 'fakefakefakefake';
process.env.PatrolAlarmTopic = 'test-topic';

var githubOrg = process.env.githubOrganization;

var response = [
  {
    login: 'jeff',
    id: 1234567,
    avatar_url: 'https://avatars.githubusercontent.com/u/1234567?v=3',
    gravatar_id: '',
    url: 'https://api.github.com/users/jeff',
    html_url: 'https://github.com/jeff',
    followers_url: 'https://api.github.com/users/jeff/followers',
    following_url: 'https://api.github.com/users/jeff/following{/other_user}',
    gists_url: 'https://api.github.com/users/jeff/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/jeff/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/jeff/subscriptions',
    organizations_url: 'https://api.github.com/users/jeff/orgs',
    repos_url: 'https://api.github.com/users/jeff/repos',
    events_url: 'https://api.github.com/users/jeff/events{/privacy}',
    received_events_url: 'https://api.github.com/users/jeff/received_events',
    type: 'User',
    site_admin: false
  },
  {
    login: 'carol',
    id: 12345678,
    avatar_url: 'https://avatars.githubusercontent.com/u/12345678?v=3',
    gravatar_id: '',
    url: 'https://api.github.com/users/carol',
    html_url: 'https://github.com/carol',
    followers_url: 'https://api.github.com/users/carol/followers',
    following_url: 'https://api.github.com/users/carol/following{/other_user}',
    gists_url: 'https://api.github.com/users/carol/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/carol/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/carol/subscriptions',
    organizations_url: 'https://api.github.com/users/carol/orgs',
    repos_url: 'https://api.github.com/users/carol/repos',
    events_url: 'https://api.github.com/users/carol/events{/privacy}',
    received_events_url: 'https://api.github.com/users/carol/received_events',
    type: 'User',
    site_admin: false
  },
  {
    login: 'ian',
    id: 123456789,
    avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=3',
    gravatar_id: '',
    url: 'https://api.github.com/users/ian',
    html_url: 'https://github.com/ian',
    followers_url: 'https://api.github.com/users/ian/followers',
    following_url: 'https://api.github.com/users/ian/following{/other_user}',
    gists_url: 'https://api.github.com/users/ian/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/ian/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/ian/subscriptions',
    organizations_url: 'https://api.github.com/users/ian/orgs',
    repos_url: 'https://api.github.com/users/ian/repos',
    events_url: 'https://api.github.com/users/ian/events{/privacy}',
    received_events_url: 'https://api.github.com/users/ian/received_events',
    type: 'User',
    site_admin: false
  },
  {
    login: 'zach',
    id: 1234567898,
    avatar_url: 'https://avatars.githubusercontent.com/u/1234567898?v=3',
    gravatar_id: '',
    url: 'https://api.github.com/users/zach',
    html_url: 'https://github.com/zach',
    followers_url: 'https://api.github.com/users/zach/followers',
    following_url: 'https://api.github.com/users/zach/following{/other_user}',
    gists_url: 'https://api.github.com/users/zach/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/zach/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/zach/subscriptions',
    organizations_url: 'https://api.github.com/users/zach/orgs',
    repos_url: 'https://api.github.com/users/zach/repos',
    events_url: 'https://api.github.com/users/zach/events{/privacy}',
    received_events_url: 'https://api.github.com/users/zach/received_events',
    type: 'User',
    site_admin: false
  }
];

function getMembersNock() {
  nock('https://api.github.com:443', {'encodedQueryParams': true})
    .get('/orgs/' + githubOrg + '/members')
    .query({filter: '2fa_disabled', page: 1})
    .reply(200, response);
};

getMembersNock();
test('2fa single user disabled', function(t) {
  var snsStub = AWS.stub('SNS', 'publish', function(params) {
    t.equal(params.Subject, 'User ian has disabled 2FA on their Github account', 'Rule detected disabling of 2FA on a single Github user account');
    this.request.promise.returns(Promise.resolve({}));
  });
  var event = 'foo';
  process.env.allowedList = 'jeff, carol, zach';
  fn(event, {}, function(err) {
    t.error(err, 'No error when calling function');
    t.end();
    snsStub.restore();
  });
});

getMembersNock();
test('2fa multiple users disabled', function(t) {
  var snsStub = AWS.stub('SNS', 'publish', function(params) {
    t.equal(params.Subject, 'Multiple users have disabled 2FA on their Github accounts', 'Rule detected disabling of 2FA on multiple Github user accounts');
    this.request.promise.returns(Promise.resolve({}));
  });
  var event = 'foo';
  process.env.allowedList = 'jeff, carol';
  fn(event, {}, function(err){
    t.error(err, 'No error when calling function');
    t.end();
    snsStub.restore();
  });
});
