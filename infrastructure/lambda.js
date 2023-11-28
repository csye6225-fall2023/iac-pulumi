import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const { policyArns, functionName, archivePath, runtime, handler, env } = config.requireObject("lambda");

export const createLambdaRole = () => {
    const lambdaRole = new aws.iam.Role("LambdaFunctionRole", {
        assumeRolePolicy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: ["lambda.amazonaws.com"],
              },
              Action: ["sts:AssumeRole"],
            },
          ],
        }),
    });

    return lambdaRole;
};

export const createLambda = (gcpServiceAccountKey, gcpBucketName, dynamodbTableName, topic, lambdaRole) => {    
    policyArns.forEach((policyArn) => {
        new aws.iam.RolePolicyAttachment(policyArn.name, {
            role: lambdaRole.name,
            policyArn: policyArn.arn,
        });
    });
    
    const topicPolicy = new aws.iam.Policy("myEc2TopicPolicy", {
    policy: {
        Version: "2012-10-17",
        Statement: [
        {
            Sid: "AllowEC2ToPublishToSNSTopic",
            Effect: "Allow",
            Action: ["sns:Publish", "sns:CreateTopic"],
            Resource: topic.arn,
        },
        ],
    },
    roles: [lambdaRole],
    });

    // Creating a Lambda function
     
    const lambdaFunction = new aws.lambda.Function(functionName, {
        functionName,
        role: lambdaRole.arn,
        runtime,
        handler,
        code: new pulumi.asset.FileArchive(archivePath),
        environment: {
            variables: {
                gcpServiceAccountKey,
                gcpBucketName,
                dynamodbTableName,
                projectId: env.projectId,
                mailgunFrom: env.mailgunFrom,
                mailgunApiKey: env.mailgunApiKey,
                mailgunDomain: env.mailgunDomain,
            }
        }
    });
       
    new aws.sns.TopicSubscription(`mySnsSub`, {
    topic: topic.arn,
    protocol: "lambda",
    endpoint: lambdaFunction.arn,
    });
    
    new aws.iam.PolicyAttachment("myTopicPolicy", {
    policyArn: topicPolicy.arn,
    roles: [lambdaRole.name],
    });
    
    new aws.lambda.Permission("with_sns", {
    statementId: "AllowExecutionFromSNS",
    action: "lambda:InvokeFunction",
    function: lambdaFunction.name,
    principal: "sns.amazonaws.com",
    sourceArn: topic.arn,
    });
}