import { Handler, Context, Callback } from 'aws-lambda';
import * as AWS from 'aws-sdk';

// XXX: AWS organizations only has endpoints in us-east-1
// XXX: https://docs.aws.amazon.com/general/latest/gr/ao.html
const org: AWS.Organizations = new AWS.Organizations({
  region: 'us-east-1',
});


/**
 *
 */
function p6_avm_account_provision(): void {

  if (org) {
    console.log(org);
  }
}

/**
 *
 * @param event
 * @param _context
 * @param _callback
 */
const handler: Handler = (event: any, _context: Context, _callback: Callback) => {
  console.log({ event });

  p6_avm_account_provision();
};

export { handler };