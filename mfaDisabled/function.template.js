const lambdaCfn = require('@mapbox/lambda-cfn');
const cf = require('@mapbox/cloudfriend');

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
    }
  },
  eventSources: {
    schedule: {
      expression: 'rate(5 minutes)'
    }
  }
});


delete lambdaTemplate.Parameters.CodeS3Bucket;
delete lambdaTemplate.Parameters.CodeS3Prefix;
delete lambdaTemplate.Resources.mfaDisabled.Properties.Environment.Variables.CodeS3Bucket;
delete lambdaTemplate.Resources.mfaDisabled.Properties.Environment.Variables.CodeS3Prefix;

lambdaTemplate.Resources.mfaDisabled.Properties.Code.S3Bucket = cf.join('-', ['utility', cf.accountId, cf.region]);
lambdaTemplate.Resources.mfaDisabled.Properties.Code.S3Key = cf.join('', ['bundles/patrol-rules-github/', cf.ref('GitSha'), '.zip']);

module.exports = lambdaTemplate;
