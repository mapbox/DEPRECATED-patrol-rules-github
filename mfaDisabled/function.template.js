'use strict';
const lambdaCfn = require('@mapbox/lambda-cfn');
const cf = require('@mapbox/cloudfriend');
const mfn = require('@mapbox/magic-cfn-resources');

const lambdaTemplate = lambdaCfn.build({
  name: 'mfaDisabled',
  parameters: {
    githubToken: {
      Type: 'String',
      Description: 'Github API token'
    },
    githubOrganization: {
      Type: 'String',
      Description: 'Name of organization on Github'
    },
    allowedList: {
      Type: 'String',
      Description: 'Comma separated list of Github accounts that do not require 2FA'
    },
    PatrolAlarmEmail: {
      Type: 'String',
      Description: 'Patrol collaborator alerts are sent to this adress'
    }
  },
  eventSources: {
    schedule: {
      expression: 'rate(5 minutes)'
    }
  },
  statements: [
    {
      Effect: 'Allow',
      Action: ['sns:Publish'],
      Resource: cf.ref('PatrolAlarmTopic')
    }
  ]
});

const lambda = lambdaTemplate.Resources['mfaDisabled'].Properties;
lambda.Environment.Variables.PatrolAlarmTopic = cf.ref('PatrolAlarmTopic');

const alarmResources = {
  Resources: {
    PatrolAlarmTopic: {
      Type: 'AWS::SNS::Topic',
      Properties: {
        Subscription: [
          {
            Endpoint: cf.ref('PatrolAlarmEmail'),
            Protocol: 'email'
          }
        ]
      }
    }
  }
};


const SnsSubscription = mfn.build({
  CustomResourceName: 'SnsSubscription',
  LogicalName: 'GithubNewCollabPatrolAlertSubscription',
  S3Bucket: lambda.Code.S3Bucket,
  S3Key: lambda.Code.S3Key,
  Handler: 'custom-resources.SnsSubscription',
  Properties: {
    SnsTopicArn: cf.ref('PatrolAlarmTopic'),
    Protocol: 'email',
    Endpoint: cf.ref('PatrolAlarmEmail')
  }
});

module.exports = cf.merge(lambdaTemplate, alarmResources, SnsSubscription);
