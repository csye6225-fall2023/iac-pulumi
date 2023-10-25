import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { getResourceName } from "../helper/resourceName.js";

const config = new pulumi.Config();
const applicationSecurityGroup = config.requireObject("security-group").applicationSecurityGroup;
const rdsSecurityGroup = config.requireObject("security-group").rdsSecurityGroup;

export const createSecurityGroups = (vpcId) => {
    const applicatonSecurityGroup = new aws.ec2.SecurityGroup(getResourceName(applicationSecurityGroup.name), {
        vpcId,
        ingress: applicationSecurityGroup.ingressRules.map(rule => ({
            protocol: rule.protocol,
            fromPort: rule.fromPort,
            toPort: rule.toPort,
            cidrBlocks: rule.cidrBlocks,
            ipv6CidrBlocks: rule.ipv6CidrBlocks,
        })),
        egress: applicationSecurityGroup.egressRules.map(rule => ({
            protocol: rule.protocol,
            fromPort: rule.fromPort,
            toPort: rule.toPort,
            cidrBlocks: rule.cidrBlocks,
        })),
        tags: {
            Name: getResourceName(applicationSecurityGroup.name),
        },
    });

    const RDSSecurityGroup = new aws.ec2.SecurityGroup(getResourceName(rdsSecurityGroup.name), {
        vpcId,
        ingress: [
            {
                protocol: rdsSecurityGroup.ingressRule.protocol,
                fromPort: rdsSecurityGroup.ingressRule.fromPort,
                toPort: rdsSecurityGroup.ingressRule.toPort,
                securityGroups: [applicatonSecurityGroup.id],
            }
        ],
        tags: {
            Name: getResourceName(rdsSecurityGroup.name),
        },
    });
  
    return { applicatonSecurityGroup, RDSSecurityGroup };
}
