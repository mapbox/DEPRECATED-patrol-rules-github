const lambdaCfn = require('@mapbox/lambda-cfn');

function patrolNotify(event, callback) {
  let message = {
    subject: (`Private repository ${event.repository.name} made public by ${event.sender.login}`).substring(0, 100),
    summary: `The private repository ${event.repository.name} was made by public by github user ${event.sender.login} at ${event.repository.updated_at}\nRepo: ${event.repository.html_url}\nUser: ${event.sender.html_url}`,
    event: event
  };
  lambdaCfn.message(message, (err, result) => {
    console.log(JSON.stringify(message));
    return callback(err, result);
  });
}

module.exports.patrolNotify = patrolNotify;
