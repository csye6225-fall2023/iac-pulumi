import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const { name, domainName, zoneId, type, ttl } = config.requireObject("dns");

export const createRecord = (instancePublicIp) => {
    const record = new aws.route53.Record(name, {
        zoneId,
        name: domainName,
        type,
        ttl,
        records: [instancePublicIp],
    });

    return record;
}