import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const { name, domainName, zoneId, type, ttl } = config.requireObject("dns");

export const createRecord = (awsAlb) => {
    const record = new aws.route53.Record(name, {
        zoneId,
        name: domainName,
        type,
        aliases: [
            {
                name: awsAlb.dnsName,
                zoneId: awsAlb.zoneId,
                evaluateTargetHealth: true
            }
        ]
    });

    return record;
}