import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { getResourceName } from "../helper/resourceName.js";

const config = new pulumi.Config();
const { name } = config.requireObject("gw");

export const createInternetGateway = (vpcId) => {
    const gw = new aws.ec2.InternetGateway(getResourceName(name), {
        vpcId,
        tags: {
            Name: getResourceName(name),
        },
    });

    return gw;
};
