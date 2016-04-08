var test = require('tape');
var rule = require('../../rules/madePublic.js');

var goodWebhook = {
  repository: {
    name: 'good-repo',
    html_url: 'https://github.com/test/testproject',
    updated_at: '2011-11-11T11:11:11Z'
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
    updated_at: '2011-11-11T11:11:11Z'
  },
  sender: {
    login: 'testuser',
    html_url: 'https://github.com/testuser'
  }
};


var goodResponse = {
  subject: 'Private repository good-repo made public by testuser'
};

var badResponse = {
  subject: 'Error detected in Github made-repository-public webhook payload',
  summary: badWebhook
};

var longResponse = 'Private repository xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';


test('Well formed webhook payload', function(t) {
  rule.fn(goodWebhook, function(err,message) {
    t.equal(message.subject, goodResponse.subject,'Subject line matched');
    t.end();
  });
});

test('Malformed webhook payload', function(t) {
  rule.fn(badWebhook, function(err,message) {
    t.equal(message.subject,badResponse.subject,'Subject line matched');
    t.end();
  });
});

test('Long subject line truncation', function(t) {
  rule.fn(longWebhook, function(err,message) {
    t.equal((message.subject).length,100,'Subject line 100 characters long');
    t.equal(message.subject,longResponse,'Subject line truncation validation');
    t.end();
  });
});
