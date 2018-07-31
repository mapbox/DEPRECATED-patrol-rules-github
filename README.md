# patrol-rules-github

[![Build Status](https://travis-ci.org/mapbox/patrol-rules-github.svg?branch=master)](https://travis-ci.org/mapbox/patrol-rules-github)

A set of AWS Lambda functions implemented using [lambda-cfn](https://github.com/mapbox/lambda-cfn) to monitor an organization's GitHub repositories and users for best practices, security and compliance. Part of the Mapbox [Patrol](https://github.com/mapbox/patrol) security framework.

## Deploying

Please see the [lambda-cfn README](https://github.com/mapbox/lambda-cfn).

## Patrol Functions

The following functions are included with patrol-rules-github. Each function is configurable, and you will be prompted to enter configuration values when deploying the function with [lambda-cfn](https://github.com/mapbox/lambda-cfn).

### 2faDisabled

- **Description** - Checks the GitHub organization for users with 2FA disabled.
- **Trigger** - Scheduled, every 5 minutes.
- **Parameters**
  - `githubOrganization` - Name of the GitHub organization to monitor.
  - `githubToken` - Personal GitHub access token. *Must* be created by an organization owner.
  - `allowedList` - A comma separated list of allowed users with 2FA disabled.

### madePublic

- **Description** - Alerts when a private repository in the organization is made public. Uses GitHub organizational webhooks, which must be configured to send events to the webhook URL. The GitHub webhook should be set to fire on events of type "public".
- **Trigger** - Webhook
- **Parameters**
  - none
- **Outputs**
  - Webhook URL
- **Github Hooks** - Enable *Visibility changes* and *Repositories events* events.

### privateRepoFork

- **Description** - Alerts when a private repository in the organization is forked. Uses GitHub organizational webhooks, which must be configured to send events to the webhook URL. The GitHub webhook should set to fire on events of type "fork".
- **Trigger** - Webhook
- **Parameters**
  - none
- **Outputs**
  - Webhook URL

## Webhook Configuration

Some of these rule functions (`madePublic`, `privateRepoFork`) rely on webhooks. Webhook URLs are automatically generated when deploying these rules to AWS. You can obtain these URLs by running `lambda-cfn info <environment name>` and checking the output section of the CloudFormation template.

Once you have the webhook URL you will need to create a GitHub organizational webhook. Only GitHub organization owners can create organizational webhooks. The Content Type for each webhook must be set to `application/json` and not the default `application/x-www-form-urlencoded`. You will also need to select individual events for each webhook rather than accept the default settings - see the rule function documentation for more details.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md).
