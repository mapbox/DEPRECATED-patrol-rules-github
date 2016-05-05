var test = require('tape');
var rule = require('../../rules/privateRepoFork.js');

var privateFork = {
  forkee: {
    name: 'forked-repo',
    updated_at: '2011-11-11T11:11:11Z',
    html_url: 'https://github.com/test/forked-repo',
    owner:  {
      login: 'defunkt',
      html_url: 'https://github.com/defunkt'
    }
  },
  repository: {
    name: 'good-repo',
    html_url: 'https://github.com/github/github-services',
    private: true
  }
};

var publicFork = {
  forkee: {
    name: 'forked-repo',
    updated_at: '2011-11-11T11:11:11Z',
    html_url: 'https://github.com/test/forked-repo',
    owner:  {
      login: 'defunkt',
      html_url: 'https://github.com/defunkt'
    }
  },
  repository: {
    name: 'public-repo',
    html_url: 'https://github.com/github/github-services',
    private: false
  }
};

var badPrivateFork = {
  forkee: {
    name: '',
    updated_at: '2011-11-11T11:11:11Z',
    html_url: 'https://github.com/test/forked-repo',
    owner:  {
      login: 'defunkt',
      html_url: 'https://github.com/defunkt'
    }
  },
  repository: {
    name: '',
    html_url: 'https://github.com/github/github-services',
    private: true
  }
};

var githubPing = {
  zen: 'test'
};

var goodResponse = 'Private repository good-repo forked by defunkt';

var publicResponse = 'Public repository public-repo forked by defunkt';

var badResponse = 'Error detected in Github private-repo-fork webhook payload';

test('GitHub ping', function(t) {
  rule.fn(githubPing, function(err, message) {
    t.equal(message,'GitHub ping event received');
    t.end();
  });
});

test('Unknown payload', function(t) {
  rule.fn({random:"payload"}, function(err, message) {
    t.equal(err,'Error: unknown payload received');
    t.end();
  });
});

test('Well formed private fork webhook payload', function(t) {
  rule.fn(privateFork, function(err, message) {
    t.equal(message.subject, goodResponse, 'Found forked private repo');
    t.end();
  });
});

test('Well formed public repo fork webhook payload', function(t) {
  rule.fn(publicFork, function(err, message) {
    t.equal(message, publicResponse, 'Found public repo fork');
    t.end();
  });
});

test('Malformed repo fork webhook payload', function(t) {
  rule.fn(badPrivateFork, function(err, message) {
    t.equal(err,'Error: unknown payload received');
    t.end();
  });
});
