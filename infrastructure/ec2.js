import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { getResourceName } from "../helper/resourceName.js";

const config = new pulumi.Config();
const ec2 = config.requireObject("ec2");
const rdsConfig = config.requireObject("rds");
const { volumeSize, volumeType } = config.requireObject("ec2").rootBlockDevice;

export const createEC2Instance = (publicSubnets, securityGroupId, database, profile) => {
    const instance = new aws.ec2.Instance(getResourceName(ec2.name), {
        instanceType: ec2.instanceType,
        ami: ec2.amiId, 
        vpcSecurityGroupIds: [securityGroupId],
        subnetId: publicSubnets[0].id,
        keyName: ec2.keyName,
        iamInstanceProfile: profile.name,
        rootBlockDevice: {
            volumeSize,
            volumeType,
            deleteOnTermination: true,
        },
        tags: {
            Name: getResourceName(ec2.name)
        },
        disableApiTermination: false, // Allow termination of the EC2 instance 
        userData: pulumi.interpolate`#!/bin/bash
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
    }, {
        dependsOn: [database]
    });

    return instance;
}