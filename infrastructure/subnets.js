import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();

const subnetNames = config.getObject("subnets").names;
const subnetCidrBlocks = config.getObject("subnets").cidrBlocks;
const availabilityZones = config.getObject("subnets").availabilityZones;
const subnetTags = config.getObject("subnets").tags;

export const createSubnets = (vpcId) => {
    const publicSubnets = [];
    const privateSubnets = [];

    for (let i = 0; i < 3; i++) {
        const publicSubnet = new aws.ec2.Subnet(subnetNames.public[i], {
            vpcId,
            cidrBlock: subnetCidrBlocks.public[i],
            availabilityZone: availabilityZones.public[i],
            mapPublicIpOnLaunch: true,
            tags: {
                Name: subnetTags.public[i]
            }
        });

        const privateSubnet = new aws.ec2.Subnet(subnetNames.private[i], {
            vpcId,
            cidrBlock: subnetCidrBlocks.private[i],
            availabilityZone: availabilityZones.private[i],
            tags: {
                Name: subnetTags.private[i]
            }
        });

        publicSubnets.push(publicSubnet);
        privateSubnets.push(privateSubnet);
    }

    return { publicSubnets, privateSubnets };
};
