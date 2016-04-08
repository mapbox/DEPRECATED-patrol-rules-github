# patrol-rules-github

[![Build Status](https://travis-ci.org/mapbox/patrol-rules-github.svg?branch=master)](https://travis-ci.org/mapbox/patrol-rules-github)

A set of rules implemented using [lambda-cfn](https://github.com/mapbox/lambda-cfn) and designed to run on a [Patrol](https://github.com/mapbox/patrol) stack.  The rules in this repository all aim to monitor an organizations Github repositories and users for best practices, security and compliance. Read more about the Patrol architecture on the [Patrol project](https://github.com/mapbox/patrol).

### Usage

Follow the steps on the [Patrol](https://github.com/mapbox/patrol) readme to set up your own Patrol stack on AWS which makes use of the patrol-rules-github rules.  Follow instructions on Patrol on how to enable or disable particular rules and how to deploy on your own AWS account.

### Rules

The following rules are included with patrol-rules-github.  Each rule is configurable, and you will be prompted to enter configuration values when creating a Patrol stack as described on the Patrol readme.

#### 2faDisabled

- **Description** - Checks the GitHub organization for users with 2fa disabled. 
- **Trigger** - Scheduled, every 5 minutes
- **Parameters**
  - githubOrganization - Name of the GitHub organization to query
  - githubToken - personal GitHub token. Must be created by an organization owner.
  - allowedList - A comma separated list of allowed users with 2fa disabled. 
  
#### madePublic

- **Description** - Alerts when a private repository in the organization is made public. Uses GitHub organizational webhooks, and requires a third party service like Zapier to proxy the webhook to the SNS topic.  
- **Trigger** - SNS topic, webhook must be proxied through a service like Zapier
- **Parameters**
  - none
- **Outputs**
  - subscribed SNS topic name
  - AWS keys for SNS topic
  
#### privateRepoFork

- **Description** - Alerts when a private repository in the organization is forked. Uses GitHub organizational webhooks, and requires a third party service like Zapier to proxy the webhook to the SNS topic.  
- **Trigger** - SNS topic, webhook must be proxied through a service like Zapier
- **Parameters**   
  - none
- **Outputs**
  - subscribed SNS topic name
  - AWS keys for SNS topic

### Tests

To run tests, clone the repository, run `npm install` and then `npm test`. 