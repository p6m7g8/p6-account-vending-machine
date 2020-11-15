import { Handler, Context, Callback } from 'aws-lambda';

interface AccountProvisionResponse {
  statusCode: number;
  body: string;
}

const accountProvision: Handler = (event: any, context: Context, callback: Callback) => {
  console.log({ event });

  const response: AccountProvisionResponse = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hooray!',
    }),
  };

  callback(undefined, response);
};

export { accountProvision };