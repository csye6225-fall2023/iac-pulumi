import * as aws from "@pulumi/aws";

export const createSnsTopic = (ec2Role) => { 
    const sns = new aws.sns.Topic('assignmentSubmissions', {deliveryPolicy: `{
      "http": {
        "defaultHealthyRetryPolicy": {
          "minDelayTarget": 20,
          "maxDelayTarget": 20,
          "numRetries": 3,
          "numMaxDelayRetries": 0,
          "numNoDelayRetries": 0,
          "numMinDelayRetries": 0,
          "backoffFunction": "linear"
        },
        "disableSubscriptionOverrides": false,
        "defaultThrottlePolicy": {
          "maxReceivesPerSecond": 1
        }
      }
    }
    `});

    const snsPublishPolicy = new aws.iam.Policy("SNSPublishPolicy", {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "sns:Publish",
            Resource: sns.arn,
          },
        ],
      },
      roles: [ec2Role.name],
    });

    new aws.iam.RolePolicyAttachment(
      "SNSPublishPolicyAttachment",
      {
        role: ec2Role.name,
        policyArn: snsPublishPolicy.arn,
      }
    );

    return sns;
}
