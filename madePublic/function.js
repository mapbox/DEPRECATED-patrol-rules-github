const lambdaCfn = require('@mapbox/lambda-cfn');

module.exports.fn = (event, context, callback) => {
  let badMessage = 'Error: unknown payload received';
  let pingEventMessage = 'GitHub ping event received';

  // Not a ping event
  if (event.zen === undefined) {
    if (event.sender && event.repository && event.sender.login && event.repository.name) {
      return notify(event, callback);
    }

    console.log(badMessage);
    return callback(badMessage);
  }

  console.log(pingEventMessage);
  return callback(null, pingEventMessage);
};

function notify(event, callback) {
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
