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
set -x
echo "Starting user data script"
# Set up environment variables
export PORT=8080
export DB_HOST=${database.endpoint.apply(endpoint => endpoint.split(":")[0])}
export DB_NAME=HealthConnectDB
export DB_USER=admin
export DB_PASSWORD=password
export DB_DIALECT=mysql
export NODE_ENV=prod
export USER_CSV_PATH=/home/admin/webapp/application/users.csv

echo "Installing Node.js"
# Install Node.js and other dependencies
yum update -y
yum install -y nodejs

echo "Configuring application"
# Create a systemd service unit file
cat << EOF > /etc/systemd/system/my-node-app.service
[Unit]
After=network.target

[Service]
Environment=PORT=8080
Environment=DB_HOST=${database.endpoint.apply(endpoint => endpoint.split(":")[0])}
Environment=DB_NAME=HealthConnectDB
Environment=DB_USER=admin
Environment=DB_PASSWORD=password
Environment=DB_DIALECT=mysql
Environment=NODE_ENV=prod
Environment=USER_CSV_PATH=/home/admin/webapp/application/users.csv
Type=simple
ExecStart=/usr/bin/node /home/admin/webapp/index.js
WorkingDirectory=/home/admin/webapp
Restart=on-failure

[Install]
WantedBy=cloud-init.target
EOF

# Reload systemd and start the service
systemctl daemon-reload
systemctl enable my-node-app
systemctl start my-node-app`
    }, {
        dependsOn: [database]
    });

    return instance;
}