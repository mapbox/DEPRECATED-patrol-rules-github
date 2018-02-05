const lambdaCfn = require('@mapbox/lambda-cfn');
/**
 * Send a dispatch message
 * @param event: Github Made Public Event
 * @param callback
 */
function dispatchNotify(event, callback) {
  const repoName = event.repository.full_name;
  const repoURL = event.repository.html_url;
  const githubUser = event.sender.login;

  let message = {
    type: 'self-service',
    retrigger: true,
    users: [
      {
        'github': githubUser
      }
    ],
    body: {
      github: {
        title: `${githubUser} made a ${repoName} repo public`,
        body: `Hey there @${githubUser}! 👋 It looks like you made a [${repoName}](${repoURL}) repo public
         
Check the following list to ensure that the repo is not leaking sensitive information:

* Check README and documentation for any sensitive information
* Check code for sensitive information (e.g. hard coded credentials, comments with sensitive info)
* Check tests for any fixtures using live data
* Check tests for any testing or debug URLs
* Check code, tests, and documentation on other branches
* Consider using https://rtyley.github.io/bfg-repo-cleaner/ to scrub sensitive data

Don't hesitate to reach out to the security team for review or if you have any questions.
        `,
      },
      slack: {
        message: `It looks like you made the *${repoName}* repo public. Please confirm and review the checklist in the GitHub issue below.`,
        prompt: 'Is this intended to be a public repository?',
        actions: {
          yes: 'Yes',
          'yes_response': 'Great, please comment on the /dispatch-alerts Github issue to explain why this is a public repo.',
          no: 'No, this is a private repo.',
          'no_response': 'Oh no! We paged the security L1 on call and they will assist you soon.',
        },
      },
    }
  };
  lambdaCfn.message(message, (err, result) => {
    console.log(JSON.stringify(message));
    return callback(err, result);
  });
}

module.exports.dispatchNotify = dispatchNotify;
