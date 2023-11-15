import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const autoScalingGroupConfig = config.requireObject("autoScalingGroup");
const { scaleUpPolicy: scaleUpPolicyConfig, scaleDownPolicy: scaleDownPolicyConfig, highCpuAlarm: highCpuAlarmConfig, lowCpuAlarm: lowCpuAlarmConfig } = autoScalingGroupConfig;

// Create an AutoScaling Group using the Launch Template
export const createAutoScalingGroup = (ec2LaunchTemplate, publicSubnets, loadBalancerTargetGroup) => {
    const autoScalingGroup = new aws.autoscaling.Group("webapp-asg", {
        desiredCapacity: autoScalingGroupConfig.desiredCapacity,
        maxSize: autoScalingGroupConfig.maxSize,
        minSize: autoScalingGroupConfig.minSize,
        cooldown: autoScalingGroupConfig.cooldown,
        vpcZoneIdentifiers: publicSubnets,
        launchTemplate: {
            id: ec2LaunchTemplate.id,
            version: "$Latest",
        },
        tags: [{ //todo check this
            key: 'Name',
            value: 'asg-instance',
            propagateAtLaunch: true,
        }],
        targetGroupArns: [loadBalancerTargetGroup.arn],
    }, {
        dependsOn: [loadBalancerTargetGroup],
    });

    const scaleUpPolicy = new aws.autoscaling.Policy(scaleUpPolicyConfig.name, {
        scalingAdjustment: scaleUpPolicyConfig.scalingAdjustment,
        adjustmentType: scaleUpPolicyConfig.adjustmentType,
        cooldown: scaleUpPolicyConfig.cooldown,
        autoscalingGroupName: autoScalingGroup.name,
        policyType: scaleUpPolicyConfig.policyType,
    });

    const scaleDownPolicy = new aws.autoscaling.Policy(scaleDownPolicyConfig.name, {
        scalingAdjustment: scaleDownPolicyConfig.scalingAdjustment,
        adjustmentType: scaleDownPolicyConfig.adjustmentType,
        cooldown: scaleDownPolicyConfig.cooldown,
        autoscalingGroupName: autoScalingGroup.name,
        policyType: scaleDownPolicyConfig.policyType,
    });

    // Define the high CPU utilization alarm at above 5% average CPU
    const highCpuAlarm = new aws.cloudwatch.MetricAlarm(highCpuAlarmConfig.name, {
        comparisonOperator: highCpuAlarmConfig.comparisonOperator,
        evaluationPeriods: highCpuAlarmConfig.evaluationPeriods,
        metricName: highCpuAlarmConfig.metricName,
        namespace: highCpuAlarmConfig.namespace,
        period: highCpuAlarmConfig.period,
        statistic: highCpuAlarmConfig.statistic,
        threshold: highCpuAlarmConfig.threshold, // 5% CPU
        alarmDescription: highCpuAlarmConfig.alarmDescription,
        alarmActions: [scaleUpPolicy.arn], // Reference to the AutoScaling group ARN
        dimensions: {
            AutoScalingGroupName: autoScalingGroup.name,
        },
    });

    // Define the low CPU utilization alarm at below 3% average CPU
    const lowCpuAlarm = new aws.cloudwatch.MetricAlarm(lowCpuAlarmConfig.name, {
        comparisonOperator: lowCpuAlarmConfig.comparisonOperator,
        evaluationPeriods: lowCpuAlarmConfig.evaluationPeriods,
        metricName: lowCpuAlarmConfig.metricName,
        namespace: lowCpuAlarmConfig.namespace,
        period: lowCpuAlarmConfig.period,
        statistic: lowCpuAlarmConfig.statistic,
        threshold: lowCpuAlarmConfig.threshold, // 3% CPU
        alarmDescription: lowCpuAlarmConfig.alarmDescription,
        alarmActions: [scaleDownPolicy.arn], // Reference to the Autoscaling group ARN
        dimensions: {
            AutoScalingGroupName: autoScalingGroup.name,
        },
    });


    return autoScalingGroup;
}