import { Handler, Context, Callback } from 'aws-lambda';
import * as AWS from 'aws-sdk';

/**
 * https://docs.aws.amazon.com/organizations/latest/APIReference/API_CreateOrganization.html#organizations-CreateOrganization-request-FeatureSet
 */
enum FeatureSets {
  /**
   * ALL: In addition to all the features supported by the consolidated billing
   * feature set, the management account can also apply any policy type to any
   * member account in the organization. For more information, see All features
   * in the AWS Organizations User Guide.
   */
  ALL = 'ALL',

  /**
   * All member accounts have their bills consolidated to and paid by the
   * management account. For more information, see Consolidated billing in the
   * AWS Organizations User Guide.
   */
  CONSOLIDATED_BILLING = 'CONSOLIDATED_BILLING',
}

interface IOrgCreateEvent {
  /**
   * @default FeatureSets.ALL
   */
  FeatureSet: FeatureSets;
}

/**
 *
 * @param event
 * @param _context
 * @param _callback
 */
const handler: Handler = (event: IOrgCreateEvent, _context: Context, _callback: Callback) => {
  console.log({ event });

  // XXX: AWS organizations only has endpoints in us-east-1
  // XXX: https://docs.aws.amazon.com/general/latest/gr/ao.html
  const org: AWS.Organizations = new AWS.Organizations({
    region: 'us-east-1',
  });

  const params: AWS.Organizations.CreateOrganizationRequest = {
    FeatureSet: event.FeatureSet ?? FeatureSets.ALL,
  };

  org.createOrganization(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      console.log(data);
    }
  });
};

export { handler };