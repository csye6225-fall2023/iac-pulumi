import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const { name, ingressRules, securityGroupRds } = config.requireObject("security-group");

export const createSecurityGroup = (vpcId) => {
    const securityGroup = new aws.ec2.SecurityGroup(name, {
        vpcId,
        ingress: ingressRules.map(rule => ({
            protocol: rule.protocol,
            fromPort: rule.fromPort,
            toPort: rule.toPort,
            cidrBlocks: rule.cidrBlocks,
            ipv6CidrBlocks: rule.ipv6CidrBlocks,
        })),
        tags: {
            Name: name,
        },
    });

    const RDSSecurityGroup = new aws.ec2.SecurityGroup(securityGroupRds.name, {
        vpcId,
        tags: {
            Name: securityGroupRds.name,
        },
    });

    new aws.ec2.SecurityGroupRule(`${securityGroupRds}-rule`, {
        type: securityGroupRds.rule.type,
        fromPort: securityGroupRds.rule.fromPort,
        toPort: securityGroupRds.rule.toPort,
        protocol: securityGroupRds.rule.protocol,
        sourceSecurityGroupId: securityGroup.id,
        securityGroupId: RDSSecurityGroup.id,
    });
    
    return { securityGroup, RDSSecurityGroup };
}
