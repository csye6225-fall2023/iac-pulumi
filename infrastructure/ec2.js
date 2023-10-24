import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { getResourceName } from "../helper/resourceName.js";

const config = new pulumi.Config();
const ec2 = config.requireObject("ec2");
const { volumeSize, volumeType } = config.requireObject("ec2").rootBlockDevice;

export const createEC2Instance = (publicSubnets, securityGroupId, database) => {
    const instance = new aws.ec2.Instance(getResourceName(ec2.name), {
        instanceType: ec2.instanceType,
        ami: ec2.amiId, 
        vpcSecurityGroupIds: [securityGroupId],
        subnetId: publicSubnets[0].id,
        keyName: ec2.keyName,
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
cd /home/admin/webapp
rm -rf .env
touch .env
echo PORT=8080 >> .env
echo DB_HOST=${ database.address } >> .env
echo DB_NAME=HealthConnectDB >> .env
echo DB_USER=admin >> .env
echo DB_PASSWORD=password >> .env
echo DB_DIALECT=mysql >> .env
echo USER_CSV_PATH=./application/users.csv >> .env
echo NODE_ENV=prod >> .env
`
    }, {
        dependsOn: [database]
    });

    return instance;
}