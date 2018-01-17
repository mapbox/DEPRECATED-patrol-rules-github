const lambdaCfn = require('@mapbox/lambda-cfn');
const madePublicEventSources = require('../lib/madePublic/cfnEventSources');

let cfnTemplate = madePublicEventSources.eventsources;

cfnTemplate.name = 'madePublicDispatch';

cfnTemplate.parameters = {
  dispatchSnsArn: {
    Type: 'String',
    Description: 'Dispatch SNS ARN'
  }
};

cfnTemplate.statements = [
  {
    Effect: 'Allow',
    Action: 'sns:Publish',
    Resource: {
      Ref: 'dispatchSnsArn'
    }
  }
];

module.exports = lambdaCfn.build(cfnTemplate);
