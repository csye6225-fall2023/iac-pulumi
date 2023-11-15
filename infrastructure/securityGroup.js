import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { getResourceName } from "../helper/resourceName.js";

const config = new pulumi.Config();
const applicationSecurityGroupConfig = config.requireObject("security-group").applicationSecurityGroup;
const rdsSecurityGroup = config.requireObject("security-group").rdsSecurityGroup;
const loadBalancerSecurityGroupConfig = config.requireObject("security-group").loadBalancerSecurityGroup;

export const createSecurityGroups = (vpcId) => {
    const loadBalancerSecurityGroup = new aws.ec2.SecurityGroup(getResourceName(loadBalancerSecurityGroupConfig.name), {
        vpcId,
        ingress: loadBalancerSecurityGroupConfig.ingressRules.map(rule => ({
            protocol: rule.protocol,
            fromPort: rule.fromPort,
            toPort: rule.toPort,
            cidrBlocks: rule.cidrBlocks,
            ipv6CidrBlocks: rule.ipv6CidrBlocks,
        })),
        egress: loadBalancerSecurityGroupConfig.egressRules.map(rule => ({
            protocol: rule.protocol,
            fromPort: rule.fromPort,
            toPort: rule.toPort,
            cidrBlocks: rule.cidrBlocks,
        })),
        tags: {
            Name: getResourceName(loadBalancerSecurityGroupConfig.name),
        },
    });

    const applicatonSecurityGroup = new aws.ec2.SecurityGroup(getResourceName(applicationSecurityGroupConfig.name), {
        vpcId,
        ingress: applicationSecurityGroupConfig.ingressRules.map(rule => ({
            protocol: rule.protocol,
            fromPort: rule.fromPort,
            toPort: rule.toPort,
            securityGroups: [loadBalancerSecurityGroup.id]
        })),
        egress: applicationSecurityGroupConfig.egressRules.map(rule => ({
            protocol: rule.protocol,
            fromPort: rule.fromPort,
            toPort: rule.toPort,
            cidrBlocks: rule.cidrBlocks,
        })),
        // ingress: [
        //     // Allow TCP traffic on port 22 from the load balancer security group
        //     { 
        //         protocol: "tcp", 
        //         fromPort: 22, 
        //         toPort: 22, 
        //         securityGroups: [loadBalancerSecurityGroup.id] 
        //     },
        //     // Allow TCP traffic on port 8080 from the load balancer security group
        //     { 
        //         protocol: "tcp", 
        //         fromPort: 8080, 
        //         toPort: 8080, 
        //         securityGroups: [loadBalancerSecurityGroup.id] 
        //     },
        // ],
        // egress: [
        //     {
        //         protocol: "-1",
        //         fromPort: 0,
        //         toPort: 0,
        //         cidrBlocks: ["0.0.0.0/0"]
                
        //     }
        // ],
        tags: {
            Name: getResourceName(applicationSecurityGroupConfig.name),
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
 
    return { applicatonSecurityGroup, RDSSecurityGroup, loadBalancerSecurityGroup };
}
