
const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  authorAddress: 'pgollucci@p6m7g8.com',
  authorName: 'Philip M. Gollucci',
  cdkVersion: '1.101.0',
  name: 'p6-account-vending-machine',
  repository: 'https://github.com/p6m7g8/p6-account-vending-machine.git',

  appEntrypoint: 'avm.ts',
  defaultReleaseBranch: 'main',
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',

  gitpod: true,

  cdkDependencies: [
    '@aws-cdk/aws-dynamodb',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-kms',
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/aws-servicecatalog',
    '@aws-cdk/aws-stepfunctions-tasks',
    '@aws-cdk/aws-stepfunctions',
    '@aws-cdk/core',
    '@aws-cdk/custom-resources',
  ],

  devDeps: [
    '@types/aws-lambda',
    'typedoc@^0.20.35',
    'esbuild@^0',
  ],

  deps: [
    'aws-lambda',
    'aws-sdk',
  ],
});

project.gitignore.exclude('.node-version');

project.github.mergify.addRule({
  name: 'Label core contributions',
  actions: {
    label: {
      add: ['contribution/core'],
    },
  },
  conditions: [
    'author~=^(pgollucci)$',
    'label!=contribution/core',
  ],
});

project.github.mergify.addRule({
  name: 'Label auto-merge for core',
  actions: {
    label: {
      add: ['auto-merge'],
    },
  },
  conditions: [
    'label=contribution/core',
    'label!=auto-merge',
  ],
});


project.github.mergify.addRule({
  name: 'Label auto-merge snyk-bot',
  actions: {
    merge: {
      method: 'squash',
      commit_message: 'title+body',
      strict: 'smart',
      strict_method: 'merge',
    },
  },
  conditions: [
    'author=snyk-bot',
    'status-success=build',
  ],
});

project.gitpod.addTasks({
  name: 'Setup',
  init: 'yarn install',
  command: 'npx projen build',
});

project.synth();
