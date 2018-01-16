function madePublic(event, notify, callback) {
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
}

module.exports.madePublic = madePublic;
