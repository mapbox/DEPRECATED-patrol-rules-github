var lambdaCfn = require('@mapbox/lambda-cfn');

module.exports = lambdaCfn.build({
  name: 'privateRepoFork',
  eventSources: {
    webhook: {
      method: 'POST',
      apiKey: false
    }
  }
});
