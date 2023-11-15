import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const ec2 = config.requireObject("ec2");
const rdsConfig = config.requireObject("rds");
const { volumeSize, volumeType, deviceName } = config.requireObject("ec2").rootBlockDevice;
 
export const createLaunchTemplate = (securityGroupId, database, iamRole) => {
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
    sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \        -a fetch-config \    -m ec2 \    -c file:/opt/csye6225/webapp/configs/cloudwatch.config.json \    -s
    sudo systemctl enable amazon-cloudwatch-agent
    sudo systemctl start amazon-cloudwatch-agent`

    // Create a new Launch Template
    const webAppLaunchTemplate = new aws.ec2.LaunchTemplate("webAppLaunchTemplate", {
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
                    deleteOnTermination: true, //todo check this
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
                deleteOnTermination: true,
                securityGroups: [securityGroupId],
            }
        ]
    }, {
        dependsOn: [database]
    });

    return webAppLaunchTemplate;
}
