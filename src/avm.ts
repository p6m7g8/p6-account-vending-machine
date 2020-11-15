import * as ddb from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';
import * as kms from '@aws-cdk/aws-kms';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as cdk from '@aws-cdk/core';

/**
 * Account Vending Machine Properties
 */
export interface IP6avmProps {
  /**
   * @default undefined
   */
  keyTable?: kms.IKey;
}

/**
 * The Account Vending Machine
 */
export class P6avm extends cdk.Resource {
  readonly keyTable: kms.IKey;

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: IP6avmProps = {}) {
    super(scope, id);

    /**
     *
     */
    this.keyTable = props.keyTable ?? new kms.Key(this, 'kms/ddb/tables/accounts', {
      alias: 'p6/avm/account/key',
      description: 'Account Vending Machine DDB Accounts Table',
      enableKeyRotation: true,
    });

    /**
     *
     */
    const accountsTable = new ddb.Table(this, 'ddb/tables/accounts', {
      partitionKey: { name: 'alias', type: ddb.AttributeType.STRING },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      encryption: ddb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: this.keyTable,
    });

    /**
     *
     */
    const orgCreatePolicy = new iam.PolicyStatement({
      actions: [
        'organizations:CreateOrganization',
      ],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    });
    const createOrg = new lambda.NodejsFunction(this, 'org-create', {
      description: 'Creates the Organization',
    });
    createOrg.addToRolePolicy(orgCreatePolicy);

    /**
     *
     */
    const accountCreatePolicy = new iam.PolicyStatement({
      actions: [
        'organizations:CreateAccount',
      ],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    });
    const createAccount = new lambda.NodejsFunction(this, 'account-create', {
      description: 'Creates an Account',
    });
    createAccount.addToRolePolicy(accountCreatePolicy);

    /**
     *
     */
    const provisionAccount = new lambda.NodejsFunction(this, 'account-provision', {
      description: 'Provisions an Account',
    });

    /**
     *
     */
    const createOrgJob = new tasks.LambdaInvoke(this, 'tasks/org/create', {
      lambdaFunction: createOrg,
      outputPath: '$.StatusCode',
    });
    const createAccountJob = new tasks.LambdaInvoke(this, 'tasks/account/create', {
      lambdaFunction: createAccount,
      outputPath: '$.StatusCode',
    });
    const provisionAccountJob = new tasks.LambdaInvoke(this, 'tasks/account/provision', {
      lambdaFunction: provisionAccount,
      inputPath: '$.AccountConfig',
      outputPath: '$.StatusCode',
    });

    /**
     *
     */
    const wait = new sfn.Wait(this, 'Wait', {
      time: sfn.WaitTime.secondsPath('$.waitSeconds'),
    });
    const jobFailed = new sfn.Fail(this, 'Fail', {
      error: 'WorkflowFailure',
      cause: 'Something went wrong',
    });

    /**
     *
     */
    const orgChain = sfn.Chain.start(createOrgJob);
    const accountChain = sfn.Chain.start(createAccountJob)
      .next(wait)
      .next(new sfn.Choice(this, 'Account Creation Complete?')
        .when(sfn.Condition.stringEquals('$.status', 'FAILED'), jobFailed)
        .when(sfn.Condition.stringEquals('$.status', 'SUCCEEDED'), provisionAccountJob)
        .otherwise(wait));

    /**
     *
     */
    const orgMachine = new sfn.StateMachine(this, 'machines/org', {
      definition: orgChain,
      tracingEnabled: true,
      timeout: cdk.Duration.minutes(1),
    });

    const accountMachine = new sfn.StateMachine(this, 'machines/account', {
      definition: accountChain,
      tracingEnabled: true,
      timeout: cdk.Duration.minutes(2),
    });

    /**
     *
     */
    accountsTable.grantReadWriteData(orgMachine.role);
    accountsTable.grantReadWriteData(accountMachine.role);
  }
}

/**
 *
 */
export class MyStack extends cdk.Stack {
  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps = {}) {
    super(scope, id, props);

    /**
     *
     */
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