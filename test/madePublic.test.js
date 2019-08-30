'use strict';
const test = require('tape');
const rule = require('../madePublic/function.js');

const goodWebhook = {
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

const badWebhook = {
  repository: {
    name: '',
    html_url: 'https://github.com/test/testproject',
    updated_at: '2011-11-11T11:11:11Z'
  },
  sender: {
    html_url: 'https://github.com/testuser'
  }
};

const longWebhook = {
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

const githubPing = {
  zen: 'test'
};

const goodResponse = {
  subject: 'Private repository good-repo made public by testuser'
};

const longResponse = 'Private repository xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

const deletedPrivateHookEvent = {
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

const createdPrivateHookEvent = {
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

const createdPublicHookEvent = {
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

test('GitHub ping', (t) => {
  rule.fn(githubPing, {}, (err, message) => {
    t.error(err, 'does not error');
    t.equal(message,'GitHub ping event received');
    t.end();
  });
});

test('Unknown payload', (t) => {
  rule.fn('{"random":"payload"}', {}, (err) => {
    t.equal(err, 'Error: unknown payload received');
    t.end();
  });
});

test('Well formed webhook payload', (t) => {
  rule.fn(goodWebhook, {}, (err,message) => {
    t.error(err, 'does not error');
    t.equal(message.subject, goodResponse.subject, 'Subject line matched');
    t.end();
  });
});

test('Malformed webhook payload', (t) => {
  rule.fn(badWebhook, {}, (err) => {
    t.equal(err,'Error: unknown payload received');
    t.end();
  });
});

test('Long subject line truncation', (t) => {
  rule.fn(longWebhook, {}, (err, message) => {
    t.error(err, 'does not error');
    t.equal((message.subject).length, 100, 'Subject line 100 characters long');
    t.equal(message.subject, longResponse, 'Subject line truncation validation');
    t.end();
  });
});

test('It should trigger a message when the repo is not created', (t) => {
  rule.fn(deletedPrivateHookEvent, {}, (err) => {
    t.error(err, 'The repository good-repo was not created. Action deleted');
    t.end();
  });
});

test('It should trigger a message when the repo is not created', (t) => {
  rule.fn(deletedPrivateHookEvent, {}, (err) => {
    t.error(err, 'Error: unknown payload received');
    t.end();
  });
});

test('It should trigger a message when a public repo is created', (t) => {
  rule.fn(createdPublicHookEvent, {}, (err, message) => {
    t.error(err, 'does not error');
    t.equal(message.subject, 'Private repository good-repo made public by testuser');
    t.end();
  });
});

test('It should not trigger a message when a private repo is created', (t) => {
  rule.fn(createdPrivateHookEvent, {}, (err, message) => {
    t.error(err, 'does not error');
    t.equal(message, 'The repository good-repo is private');
    t.end();
  });
});
