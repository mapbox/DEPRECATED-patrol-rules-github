var test = require('tape');
var rule = require('../madePublic/function.js');

var goodWebhook = {
  repository: {
    name: 'good-repo',
    html_url: 'https://github.com/test/testproject',
    updated_at: '2011-11-11T11:11:11Z',
    private: false
  },
  sender: {
    login: 'testuser',
    html_url: 'https://github.com/testuser'
  }
};

var badWebhook = {
  repository: {
    name: '',
    html_url: 'https://github.com/test/testproject',
    updated_at: '2011-11-11T11:11:11Z'
  },
  sender: {
    html_url: 'https://github.com/testuser'
  }
};

var longWebhook = {
  repository: {
    name: Array(200).join('x'),
    html_url: 'https://github.com/test/testproject',
    updated_at: '2011-11-11T11:11:11Z',
    private: false
  },
  sender: {
    login: 'testuser',
    html_url: 'https://github.com/testuser'
  }
};

var githubPing = {
  zen: 'test'
};

var goodResponse = {
  subject: 'Private repository good-repo made public by testuser'
};

var longResponse = 'Private repository xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

var deletedPrivateHookEvent = {
  action: 'deleted',
  repository: {
    name: 'good-repo',
    html_url: 'https://github.com/test/testproject',
    updated_at: '2011-11-11T11:11:11Z',
    private: false
  },
  sender: {
    login: 'testuser',
    html_url: 'https://github.com/testuser'
  }
};

var createdPrivateHookEvent = {
  action: 'created',
  repository: {
    name: 'good-repo',
    html_url: 'https://github.com/test/testproject',
    updated_at: '2011-11-11T11:11:11Z',
    private: true
  },
  sender: {
    login: 'testuser',
    html_url: 'https://github.com/testuser'
  }
};

var createdPublicHookEvent = {
  action: 'created',
  repository: {
    name: 'good-repo',
    html_url: 'https://github.com/test/testproject',
    updated_at: '2011-11-11T11:11:11Z',
    private: false
  },
  sender: {
    login: 'testuser',
    html_url: 'https://github.com/testuser'
  }
};

test('GitHub ping', function(t) {
  rule.fn(githubPing, {}, function(err, message) {
    t.error(err, 'does not error');
    t.equal(message,'GitHub ping event received');
    t.end();
  });
});

test('Unknown payload', function(t) {
  rule.fn('{"random":"payload"}', {}, function(err, _message) {
    t.equal(err, 'Error: unknown payload received');
    t.end();
  });
});

test('Well formed webhook payload', function(t) {
  rule.fn(goodWebhook, {}, function(err,message) {
    t.error(err, 'does not error');
    t.equal(message.subject, goodResponse.subject, 'Subject line matched');
    t.end();
  });
});

test('Malformed webhook payload', function(t) {
  rule.fn(badWebhook, {}, function(err, _message) {
    t.equal(err,'Error: unknown payload received');
    t.end();
  });
});

test('Long subject line truncation', function(t) {
  rule.fn(longWebhook, {}, function(err, message) {
    t.error(err, 'does not error');
    t.equal((message.subject).length, 100, 'Subject line 100 characters long');
    t.equal(message.subject, longResponse, 'Subject line truncation validation');
    t.end();
  });
});

test('It should trigger a message when the repo is not created', function(t) {
  rule.fn(deletedPrivateHookEvent, {}, function(err, _message) {
    t.error(err, 'The repository good-repo was not created. Action deleted');
    t.end();
  });
});

test('It should trigger a message when the repo is not created', function(t) {
  rule.fn(deletedPrivateHookEvent, {}, function(err, _message) {
    t.error(err, 'Error: unknown payload received');
    t.end();
  });
});

test('It should trigger a message when a public repo is created', function(t) {
  rule.fn(createdPublicHookEvent, {}, function(err, message) {
    t.error(err, 'does not error');
    t.equal(message.subject, 'Private repository good-repo made public by testuser');
    t.end();
  });
});

test('It should not trigger a message when a private repo is created', function(t) {
  rule.fn(createdPrivateHookEvent, {}, function(err, message) {
    t.error(err, 'does not error');
    t.equal(message, 'The repository good-repo is private');
    t.end();
  });
});
