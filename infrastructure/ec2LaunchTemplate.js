import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const ec2 = config.requireObject("ec2");
const rdsConfig = config.requireObject("rds");
const {region} = config.requireObject("aws-config");
const { volumeSize, volumeType, deviceName } = config.requireObject("ec2").rootBlockDevice;
 
export const createLaunchTemplate = (securityGroupId, database, iamRole, sns) => {
    const userData = pulumi.interpolate`#!/bin/bash
    cd /opt/csye6225/webapp
    touch .env
    echo PORT=8080 >> .env
    echo DB_HOST=${ database.address } >> .env
    echo DB_NAME=${rdsConfig.dbName} >> .env
    echo DB_USER=${rdsConfig.username} >> .env
    echo DB_PASSWORD=${rdsConfig.password} >> .env
    echo DB_DIALECT=${rdsConfig.dialect} >> .env
    echo USER_CSV_PATH=./application/users.csv >> .env
    echo NODE_ENV=prod >> .env
    echo SNS_TOPIC_ARN=${sns.arn} >> .env
    echo region=${region} >> .env
    sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \        -a fetch-config \    -m ec2 \    -c file:/opt/csye6225/webapp/configs/cloudwatch.config.json \    -s
    sudo systemctl enable amazon-cloudwatch-agent
    sudo systemctl start amazon-cloudwatch-agent`

    // Create a new Launch Template
    const webAppLaunchTemplate = new aws.ec2.LaunchTemplate("csye6225_asg", {
        imageId: ec2.amiId,
        instanceType: ec2.instanceType,
        keyName: ec2.keyName,
        iamInstanceProfile: {
            name: iamRole.name,
        },
        blockDeviceMappings: [
            {
                deviceName,
                ebs: {
                    deleteOnTermination: true, // This ensures EBS Volume gets deleted on instance termination
                    volumeSize,
                    volumeType,
                }
            }
        ],
        disableApiTermination: false, // Allow termination of the EC2 instance 
        userData: userData.apply(userData => Buffer.from(userData).toString("base64")),
        networkInterfaces: [
            {
                associatePublicIpAddress: true,
                deleteOnTermination: true, // This ensures Network Interface gets deleted on instance termination
                securityGroups: [securityGroupId],
            }
        ],
        tags: {
            Name: "csye6225_asg"
        }
    }, {
        dependsOn: [database, sns]
    });

    return webAppLaunchTemplate;
}
