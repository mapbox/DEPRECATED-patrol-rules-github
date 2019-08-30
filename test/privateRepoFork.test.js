'use strict';
const test = require('tape');
const rule = require('../privateRepoFork/function.js');

const privateFork = {
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

const publicFork = {
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

const badPrivateFork = {
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

const githubPing = {
  zen: 'test'
};

const goodResponse = 'Private repository good-repo forked by defunkt';

const publicResponse = 'Public repository public-repo forked by defunkt';

test('GitHub ping', {}, (t) => {
  rule.fn(githubPing, {}, (err, message) => {
    t.error(err, 'does not error');
    t.equal(message,'GitHub ping event received');
    t.end();
  });
});

test('Unknown payload', {}, (t) => {
  rule.fn({ random: 'payload' }, {}, (err) => {
    t.equal(err,'Error: unknown payload received');
    t.end();
  });
});

test('Well formed private fork webhook payload', (t) => {
  rule.fn(privateFork, {}, (err, message) => {
    t.error(err, 'does not error');
    t.equal(message.subject, goodResponse, 'Found forked private repo');
    t.end();
  });
});

test('Well formed public repo fork webhook payload', (t) => {
  rule.fn(publicFork, {}, (err, message) => {
    t.error(err, 'does not error');
    t.equal(message, publicResponse, 'Found public repo fork');
    t.end();
  });
});

test('Malformed repo fork webhook payload', (t) => {
  rule.fn(badPrivateFork, {}, (err) => {
    t.equal(err, 'Error: unknown payload received');
    t.end();
  });
});
