const lambdaCfn = require('@mapbox/lambda-cfn');

const lambdaTemplate = lambdaCfn.build({
  name: 'publicProject',
  eventSources: {
    webhook: {
      method: 'POST',
      apiKey: false
    }
  }
});

module.exports = lambdaTemplate;
