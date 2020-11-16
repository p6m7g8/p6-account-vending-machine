import { Handler, Context, Callback } from 'aws-lambda';
import * as AWS from 'aws-sdk';

// XXX: AWS organizations only has endpoints in us-east-1
// XXX: https://docs.aws.amazon.com/general/latest/gr/ao.html
const org: AWS.Organizations = new AWS.Organizations({
  region: 'us-east-1',
});

/**
 *
 * @param car
 */
function p6_avm_account_create(car: AWS.Organizations.CreateAccountRequest) {

  org.createAccount(car, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      console.log(data);
    }
  });
}

/**
 *
 * @param event
 * @param _context
 * @param _callback
 */
const handler: Handler = (event: AWS.Organizations.CreateAccountRequest, _context: Context, _callback: Callback) => {
  console.log({ event });

  p6_avm_account_create(event);
};

export { handler };
