/**
 * Triggers notifications on Github Made Public Events
 * @param event: Github Event
 * @param notify: Function that will handle the notification
 * @param callback
 * @returns {*}
 */
function madePublic(event, notify, callback) {
  let badMessage = 'Error: unknown payload received';
  let pingEventMessage = 'GitHub ping event received';

  let isPingEvent = event.zen !== undefined;
  if (!isPingEvent) {

    if (event.action && event.action !== 'created') {
      return callback(null, `The repository ${event.repository.name} was was not created. Action ${event.action}`);
    }

    if (event.sender && event.repository && event.sender.login && event.repository.name && event.repository.private === false) {
      return notify(event, callback);
    }

    console.log(badMessage);
    return callback(badMessage);
  }

  console.log(pingEventMessage);
  return callback(null, pingEventMessage);
}

module.exports.madePublic = madePublic;
