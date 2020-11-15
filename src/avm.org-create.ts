import { Handler, Context, Callback } from 'aws-lambda';

interface OrgCreateResponse {
  statusCode: number;
  body: string;
}

const handler: Handler = (event: any, context: Context, callback: Callback) => {
  console.log({ event });

  const response: OrgCreateResponse = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hooray!',
    }),
  };

  callback(undefined, response);
};

export { handler };