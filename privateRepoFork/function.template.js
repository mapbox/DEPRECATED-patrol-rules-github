const lambdaCfn = require('@mapbox/lambda-cfn');
const cf = require('@mapbox/cloudfriend');

const lambdaTemplate = lambdaCfn.build({
  name: 'privateRepoFork',
  eventSources: {
    webhook: {
      method: 'POST',
      apiKey: false
    }
  }
});


delete lambdaTemplate.Parameters.CodeS3Bucket;
delete lambdaTemplate.Parameters.CodeS3Prefix;
delete lambdaTemplate.Resources.privateRepoFork.Properties.Environment.Variables.CodeS3Bucket;
delete lambdaTemplate.Resources.privateRepoFork.Properties.Environment.Variables.CodeS3Prefix;

lambdaTemplate.Resources.privateRepoFork.Properties.Code.S3Bucket = cf.join('-', ['utility', cf.accountId, cf.region]);
lambdaTemplate.Resources.privateRepoFork.Properties.Code.S3Key = cf.join('', ['bundles/patrol-rules-github/', cf.ref('GitSha'), '.zip']);

module.exports = lambdaTemplate;
