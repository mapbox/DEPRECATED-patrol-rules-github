const lambdaCfn = require('@mapbox/lambda-cfn');

let cfnTemplate = {
  name: 'madePublic',
  eventSources: {
    webhook: {
      method: 'POST',
      apiKey: false
    }
  }
};

module.exports = lambdaCfn.build(cfnTemplate);
