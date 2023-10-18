import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { getResourceName } from "../helper/resourceName.js";

const config = new pulumi.Config();
const ec2 = config.requireObject("ec2");
const { volumeSize, volumeType } = config.requireObject("ec2").rootBlockDevice;

export const createEC2Instance = (publicSubnets, securityGroupId) => {
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
        disableApiTermination: false, // Allow termination of the EC2 instance //@TODO verify
    });

    return instance;
}