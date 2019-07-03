const lambdaCfn = require('@mapbox/lambda-cfn');

const lambdaTemplate = lambdaCfn.build({
  name: 'privateRepoFork',
  eventSources: {
    webhook: {
      method: 'POST',
      apiKey: false
    }
  }
});

module.exports = lambdaTemplate;
