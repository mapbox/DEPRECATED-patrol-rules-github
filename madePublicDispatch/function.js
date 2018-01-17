const AWS = require('aws-sdk');
const github = require('../lib/madePublic/event.js');

function notify(event, callback) {
  const sns = new AWS.SNS();

  const repoName = event.repository.name;
  const githubUser = event.repository.sender.login;
  const dispatchSnsArn = process.env.dispatchSnsArn;

  const message = {
    type: 'self-service',
    retrigger: false,
    users: [
      {
        github: githubUser
      }
    ],
    body: {
      github: {
        title: `${githubUser} made a ${repoName} repo public`,
        body: `Hey there @${githubUser} 👋 ! It looks like you made a ${repoName} repo public
         
Check the following list to ensure that the repo is not leaking sensitive information:

* Check README and documentation for any Company-isms with sensitive information
* Check code for sensitive information (e.g. hard coded credentials, comments with sensitive info)
* Check tests for any fixtures using live data
* Check tests for any testing or debug URLs
* Check code, tests, and documentation on other branches
* Use https://rtyley.github.io/bfg-repo-cleaner/ to clean your sensitive data

Consider notify the security team in case of any information leak.
        `,
      },
      slack: {
        message: `Hey there! :wave: It looks like you made the ${repoName} repo public.`,
        prompt: 'Is this a public repository?',
        actions: {
          yes: 'Yes',
          'yes_response': 'Great, please comment on the /dispatch-alerts Github issue to explain why this is a public repo.',
          no: 'No, this is a private repo.',
          'no_response': 'Oh no! We paged the security L1 on call and they will assist you soon.',
        },
      },
    }
  };
  const params = {
    Message: JSON.stringify(message),
    TopicArn: dispatchSnsArn
  };
  sns.publish(params, function(err,data) {
    if (err) return callback(err);
    return callback(null, data);
  });
}

module.exports.fn = (event, context, callback) => {
  return github.madePublic(event, notify, callback);
};
