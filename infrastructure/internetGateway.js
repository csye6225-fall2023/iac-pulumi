import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const gwConfig = config.requireObject("gw");

export const createInternetGateway = (vpcId) => {
    const gw = new aws.ec2.InternetGateway(gwConfig.name, {
        vpcId,
        tags: {
            Name: gwConfig.metaName,
        },
    });

    return gw;
};
