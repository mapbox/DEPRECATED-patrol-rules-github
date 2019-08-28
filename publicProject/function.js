const githubMadePublicEvent = require('../lib/madePublic/event.js');
const dispatchNotify = require('../lib/madePublic/dispatchNotify').dispatchNotify;
const patrolNotify = require('../lib/madePublic/patrolNotify').patrolNotify;

module.exports.fn = (event, context, callback) => {
  console.log(event);
  /**
  if (process.env.DispatchSnsArn) {
    return githubMadePublicEvent.madePublic(event, dispatchNotify, callback);
  }

  return githubMadePublicEvent.madePublic(event, patrolNotify, callback);
  **/
  return callback(null);
};
