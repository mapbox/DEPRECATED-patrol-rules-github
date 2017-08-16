var lambdaCfn = require('@mapbox/lambda-cfn');

module.exports = lambdaCfn.build({
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
