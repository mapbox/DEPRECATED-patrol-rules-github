const lambdaCfn = require('@mapbox/lambda-cfn');
const cf = require('@mapbox/cloudfriend');

const lambdaTemplate = lambdaCfn.build({
  name: 'madePublic',
  eventSources: {
    webhook: {
      method: 'POST',
      apiKey: false
    }
  }
});

delete lambdaTemplate.Parameters.CodeS3Bucket;
delete lambdaTemplate.Parameters.CodeS3Prefix;
delete lambdaTemplate.Resources.madePublic.Properties.Environment.Variables.CodeS3Bucket;
delete lambdaTemplate.Resources.madePublic.Properties.Environment.Variables.CodeS3Prefix;

lambdaTemplate.Resources.madePublic.Properties.Code.S3Bucket = cf.join('-', ['utility', cf.accountId, cf.region]);
lambdaTemplate.Resources.madePublic.Properties.Code.S3Key = cf.join('', ['bundles/patrol-rules-github/', cf.ref('GitSha'), '.zip']);

module.exports = lambdaTemplate;
