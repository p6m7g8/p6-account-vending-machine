import { Handler, Context, Callback } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const handler: Handler = (event: any, _context: Context, _callback: Callback) => {
  console.log({ event });

  // XXX: AWS organizations only has endpoints in us-east-1
  // XXX: https://docs.aws.amazon.com/general/latest/gr/ao.html
  const org: AWS.Organizations = new AWS.Organizations({ region: 'us-east-1' });

  const params: AWS.Organizations.CreateAccountRequest = {
    AccountName: event.AccountName,
    Email: event.Email,
  };

  org.createAccount(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      console.log(data);
    }
  });
};

export { handler };
