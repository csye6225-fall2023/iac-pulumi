import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const { name } = config.requireObject("dynamoDB");

// Create a DynamoDB table
export const createDynamoDBTable = (lambdaRole) => {
    const table = new aws.dynamodb.Table(name, {
        attributes: [
            {
                name: "id",
                type: "S",
            },
            {
                name: "status",
                type: "S",
            },
            {
                name: "timestamp",
                type: "S",
            }, 
            {
                name: "email",
                type: "S",
            }
        ],
        hashKey: "id",
        rangeKey: "status",
        readCapacity: 5,
        writeCapacity: 5,
        globalSecondaryIndexes: [
            {
                name: `${name}-Timestamp`,
                hashKey: "timestamp",
                rangeKey: "id",
                readCapacity: 5,
                writeCapacity: 5,
                projectionType: "ALL",
            },
            {
                name: `${name}-Email`,
                hashKey: "email",
                projectionType: "ALL",
                readCapacity: 5,
                writeCapacity: 5,
            }
        ],
    });

    const dynamoDBPolicy = new aws.iam.Policy("DynamoDBAccessPolicy", {
        policy: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:Query", 
              ],
              Resource: table.arn,
            },
          ],
        },
      });
       
      // Attach the DynamoDB policy to the Lambda execution role
      const dynamoDBPolicyAttachment = new aws.iam.PolicyAttachment(
        "DynamoDBPolicyAttachment",
        {
          policyArn: dynamoDBPolicy.arn,
          roles: [lambdaRole.name],
          dependsOn: [table], // Assuming lambdaRole is the execution role for your Lambda function
        }
      );

    return table;
}