import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();

const vpcConfig = config.requireObject("vpc");

//Create a VPC
const vpc = new aws.ec2.Vpc(vpcConfig.name, {
    cidrBlock: vpcConfig.cidrBlock,
    tags: {
        Name: vpcConfig.metaName,
    },
});

