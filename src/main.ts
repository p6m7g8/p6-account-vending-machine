import * as path from 'path';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as kms from '@aws-cdk/aws-kms';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as cdk from '@aws-cdk/core';

export interface IP6avmProps {

}

export class P6avm extends cdk.Resource {
  constructor(scope: cdk.Construct, id: string, props: IP6avmProps = {}) {
    super(scope, id, props);

    // Encryption Keys
    const keyTable = new kms.Key(this, 'kms/ddb/tables/accounts', {
      alias: 'p6/avm/account/key',
      description: 'Account Vending Machine DDB Accounts Table',
      enableKeyRotation: true,
    });

    // DynamoDB Table
    const accountsTable = new ddb.Table(this, 'ddb/tables/accounts', {
      partitionKey: { name: 'alias', type: ddb.AttributeType.STRING },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      encryption: ddb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: keyTable,
    });

    // Lambda: Create Org
    const createOrg = new lambda.NodejsFunction(this, 'lambda/org/create', {
      entry: path.join(__dirname, '../resources/lambda/org-create.ts'),
      description: 'Creates the Organization',
    });

    // Lambda: Create Account
    const createAccount = new lambda.NodejsFunction(this, 'lambda/account/create', {
      entry: path.join(__dirname, '../resources/lambda/account-create.ts'),
      description: 'Creates an Account',
    });

    // Lambda: Provision Account
    const provisionAccount = new lambda.NodejsFunction(this, 'lambda/account/provision', {
      entry: path.join(__dirname, '../resources/lambda/account-provision.ts'),
      description: 'Provisions an Account',
    });

    // Tasks
    const createOrgJob = new tasks.LambdaInvoke(this, 'tasks/org/create', {
      lambdaFunction: createOrg,
      outputPath: '$.STATUS',
    });

    const createAccountJob = new tasks.LambdaInvoke(this, 'tasks/account/create', {
      lambdaFunction: createAccount,
      outputPath: '$.STATUS',
    });

    const provisionAccountJob = new tasks.LambdaInvoke(this, 'tasks/account/provision', {
      lambdaFunction: provisionAccount,
      inputPath: '$.AccountConfig',
      outputPath: '$.STATUS',
    });

    // Chains
    const orgChain = sfn.Chain.start(createOrgJob);

    const accountChain = sfn.Chain.start(createAccountJob)
      .next(provisionAccountJob);

    // Machines
    const orgMachine = new sfn.StateMachine(this, 'machines/org', {
      definition: orgChain,
      tracingEnabled: true,
    });

    const accountMachine = new sfn.StateMachine(this, 'machines/account', {
      definition: accountChain,
      tracingEnabled: true,
    });

    accountsTable.grantReadWriteData(orgMachine.role);
    accountsTable.grantReadWriteData(accountMachine.role);
  }
}

export class MyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps = {}) {
    super(scope, id, props);

    new P6avm(this, 'p6/avm');

  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

new MyStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();