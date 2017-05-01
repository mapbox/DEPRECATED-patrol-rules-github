var test = require('tape');
var rule = require('../../rules/forcePush.js');
var testData = {
  ref: "refs/heads/master",
  forced: true,
  repository: {
    name: "public-repo",
    master_branch: "master"
    },
  pusher: {
    name: "arunasank",
    email: "aruna@mapbox.com"
  }
};

var githubPing = {
  zen: 'test'
};

test('GitHub ping', function(t) {
  rule.forcePush(githubPing, function(err, message) {
    t.equal(message,'GitHub ping event received');
    t.end();
  });
});

test('Well formed webhook payload', function(t) {
  rule.forcePush(testData, function(err,message) {
    t.equal(message.event, testData,'events matched');
    t.end();
  });
});

test('Event for push to a branch that is not master', function(t) {
  testData.ref = "refs/heads/branch-on-a-tree";
  rule.forcePush(testData, function(err,message) {
    t.equal(message, 'Force push to a branch that is not master','message matches');
    t.end();
  });
});