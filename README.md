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

### privateRepoFork

- **Description** - Alerts when a private repository in the organization is forked. Uses GitHub organizational webhooks, which must be configured to send events to the webhook URL. The GitHub webhook should set to fire on events of type "fork".
- **Trigger** - Webhook
- **Parameters**
  - none
- **Outputs**
  - Webhook URL

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md).
