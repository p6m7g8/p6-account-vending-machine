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
interface IOrgCreateEvent {
  /**
   * @default ALL
   */
  FeatureSet: AWS.Organizations.OrganizationFeatureSet;
}

/**
 * Creates and Organization with the requested featureSet
 *
 * @param featureSet
 * @default 'ALL'
 */
function p6_avm_org_create(featureSet: AWS.Organizations.OrganizationFeatureSet = 'ALL'): void {

  const params: AWS.Organizations.CreateOrganizationRequest = {
    FeatureSet: featureSet,
  };

  org.createOrganization(params, function (err, data) {
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
const handler: Handler = (event: IOrgCreateEvent, _context: Context, _callback: Callback) => {
  console.log({ event });

  p6_avm_org_create(event.FeatureSet);
};

export { handler };