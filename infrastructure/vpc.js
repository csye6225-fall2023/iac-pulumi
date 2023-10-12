import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { getResourceName } from "../helper/resourceName.js";

const config = new pulumi.Config();
const { cidrBlock, name } = config.requireObject("vpc");

export const createVpc = () => {
    const vpc = new aws.ec2.Vpc(getResourceName(name), {
        cidrBlock: cidrBlock,
        tags: {
            Name: getResourceName(name),
        },
    });
    
    return vpc;
}