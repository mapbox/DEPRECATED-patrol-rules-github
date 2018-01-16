const lambdaCfn = require('@mapbox/lambda-cfn');
const cfnEventSources = require('../lib/madePublic/cfnEventSources');

let cfnTemplate = cfnEventSources.eventSources;
cfnTemplate.name = 'madePublic';

module.exports = lambdaCfn.build(cfnTemplate);
