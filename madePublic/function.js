const message = require('@mapbox/lambda-cfn').message;

module.exports.fn = (event, context, callback) => {
  if (event.zen !== undefined) {
    let ping = 'GitHub ping event received';
    console.log(ping);
    return callback(null, ping);
  } else {
    if (event.sender && event.repository && event.sender.login && event.repository.name) {
      let notif = {
        subject: (`Private repository ${event.repository.name} made public by ${event.sender.login}`).substring(0, 100),
        summary: `The private repository ${event.repository.name} was made by public by github user ${event.sender.login} at ${event.repository.updated_at}\nRepo: ${event.repository.html_url}\nUser: ${event.sender.html_url}`,
        event: event
      };
      message(notif, (err, result) => {
        console.log(JSON.stringify(notif));
        return callback(err, result);
      });
    } else {
      let badmsg = 'Error: unknown payload received';
      console.log(badmsg);
      return callback(badmsg);
    }
  }
};
