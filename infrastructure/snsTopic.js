import * as aws from "@pulumi/aws";

export const createSnsTopic = () => { 
    const topic = new aws.sns.Topic('assignmentSubmissions', {deliveryPolicy: `{
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

    return topic;
}
