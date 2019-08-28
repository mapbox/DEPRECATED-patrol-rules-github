'use strict';
const lambdaCfn = require('@mapbox/lambda-cfn');

const lambdaTemplate = lambdaCfn.build({
  name: 'madePublic',
  eventSources: {
    webhook: {
      method: 'POST',
      apiKey: false
    }
  }
});

module.exports = lambdaTemplate;
