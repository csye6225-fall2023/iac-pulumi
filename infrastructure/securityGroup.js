import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { getResourceName } from "../helper/resourceName.js";

const config = new pulumi.Config();
const { name, ingressRules } = config.requireObject("security-group");

export const createSecurityGroup = (vpcId) => {
    const securityGroup = new aws.ec2.SecurityGroup(getResourceName(name), {
        vpcId,
        ingress: ingressRules.map(rule => ({
            protocol: rule.protocol,
            fromPort: rule.fromPort,
            toPort: rule.toPort,
            cidrBlocks: rule.cidrBlocks,
            ipv6CidrBlocks: rule.ipv6CidrBlocks,
        })),
        tags: {
            Name: getResourceName(name),
        },
    });

    return securityGroup;
}