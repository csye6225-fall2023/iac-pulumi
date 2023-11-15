import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const { targetGroup: targetGroupConfig, listener: listenerConfig } = config.requireObject("alb");
const { healthCheck: healthCheckConfig } = targetGroupConfig;

export const createLoadBalancer = (subnets, loadBalancerSecurityGroup, vpcId) => {
    const loadBalancer = new aws.lb.LoadBalancer("appLB", {
        securityGroups: [loadBalancerSecurityGroup.id],
        subnets,
    });

    const targetGroup = new aws.lb.TargetGroup("targetGroup", {
        vpcId, // provide your VPC id
        port: targetGroupConfig.port, // application instances port (change if different)
        protocol: targetGroupConfig.protocol,
        targetType: targetGroupConfig.targetType,
        healthCheck: {
            enabled: healthCheckConfig.enabled,
            path: healthCheckConfig.path,
            port: healthCheckConfig.port,
            protocol: healthCheckConfig.protocol,
            interval: healthCheckConfig.interval,
            timeout: healthCheckConfig.timeout,
            healthyThreshold: healthCheckConfig.healthyThreshold,
        }
    });

    const listener = new aws.lb.Listener("listener", {
        loadBalancerArn: loadBalancer.arn,
        port: listenerConfig.port,
        defaultActions: [{
            type: "forward",
            targetGroupArn: targetGroup.arn,
        }],
    });

    return {loadBalancer, targetGroup, listener};
}