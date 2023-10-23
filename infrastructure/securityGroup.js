import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const { name, ingressRules, securityGroupRds } = config.requireObject("security-group");

export const createSecurityGroup = (vpcId) => {
    const applicatonSecurityGroup = new aws.ec2.SecurityGroup(name, {
        vpcId,
        ingress: ingressRules.map(rule => ({
            protocol: rule.protocol,
            fromPort: rule.fromPort,
            toPort: rule.toPort,
            cidrBlocks: rule.cidrBlocks,
            ipv6CidrBlocks: rule.ipv6CidrBlocks,
        })),
        egress:[
            {
                protocol: "-1",
                fromPort: 0,
                toPort: 0,
                cidrBlocks: ["0.0.0.0/0"],
            }
        ],
        tags: {
            Name: name,
        },
    });

    const RDSSecurityGroup = new aws.ec2.SecurityGroup(securityGroupRds.name, {
        vpcId,
        ingress: [
            {
                protocol: securityGroupRds.rule.protocol,
                fromPort: securityGroupRds.rule.fromPort,
                toPort: securityGroupRds.rule.toPort,
                securityGroups: [applicatonSecurityGroup.id],
            }
        ],
        egress:[
            {
                protocol: "-1",
                fromPort: 0,
                toPort: 0,
                cidrBlocks: ["0.0.0.0/0"],
            }
        ],
        tags: {
            Name: securityGroupRds.name,
        },
    });
  
    return { applicatonSecurityGroup, RDSSecurityGroup };
}
