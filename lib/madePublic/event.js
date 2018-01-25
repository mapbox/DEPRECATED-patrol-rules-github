function madePublic(event, notify, callback) {
  let badMessage = 'Error: unknown payload received';
  let pingEventMessage = 'GitHub ping event received';

  let isPingEvent = event.zen !== undefined;
  if (!isPingEvent) {

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
