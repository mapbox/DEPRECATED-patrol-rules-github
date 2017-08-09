var lambdaCfn = require('@mapbox/lambda-cfn');

module.exports = lambdaCfn.build({
  name: 'madePublic',
  eventSources: {
    webhook: {
      method: 'POST',
      apiKey: false
    }
  }
});
