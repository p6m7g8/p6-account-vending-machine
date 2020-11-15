import { Handler, Context, Callback } from 'aws-lambda';

interface AccountCreateResponse {
  statusCode: number;
  body: string;
}

const accountCreate: Handler = (event: any, context: Context, callback: Callback) => {
  console.log({ event });

  const response: AccountCreateResponse = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hooray!',
    }),
  };

  callback(undefined, response);
};

export { accountCreate };