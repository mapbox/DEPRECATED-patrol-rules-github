var test = require('tape');
var rule = require('../../rules/forcePush.js');
var testData = {
  forced: true,
  repository: {
    name: "public-repo"
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
  rule.fn(githubPing, function(err, message) {
    t.equal(message,'GitHub ping event received');
    t.end();
  });
});

test('Well formed webhook payload', function(t) {
  rule.fn(testData, function(err,message) {
    // t.equal(message.event, testData,'events matched');
    console.log('######## msg ',message);
    t.end();
  });
});