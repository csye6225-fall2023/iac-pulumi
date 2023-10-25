import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { getResourceName } from "../helper/resourceName.js";

const config = new pulumi.Config();
const baseCIDR = config.requireObject("vpc").cidrBlock;
const { maxAvailabilityZones, publicSn, privateSn } = config.requireObject("subnets");

function generateCidr(octetToBeIncremented, octet, subnetPrefix) {
    const ip = baseCIDR.split("/")[0];
    let cidr = ip.split(".");
    cidr[octetToBeIncremented] = octet;
    cidr = cidr.join(".") + "/" + subnetPrefix;

    return cidr;
}

export const createSubnets = (vpcId, zones) => {
    const publicSubnets = [];
    const privateSubnets = [];

    const subnetPrefix = parseInt(baseCIDR.split("/")[1]) + 8;
    const octetToBeIncremented = (subnetPrefix / 8) - 1;
    const number_of_zones = Math.min(zones.names.length, maxAvailabilityZones);
    let octet = parseInt(baseCIDR.split("/")[0].split(".")[octetToBeIncremented]);

    for(let i = 0; i < number_of_zones; i++) {
        const publicSubnetCidr = generateCidr(octetToBeIncremented, ++octet, subnetPrefix);
        const privateSubnetCidr = generateCidr(octetToBeIncremented, octet + number_of_zones, subnetPrefix);

        //make the public and private subnets in each availability zones
        const publicSubnet = new aws.ec2.Subnet(getResourceName(`${publicSn.name}${i + 1}`), {
            vpcId,
            cidrBlock: publicSubnetCidr,
            availabilityZone: zones.names[i],
            mapPublicIpOnLaunch: true,
            tags: {
                Name: getResourceName(`${publicSn.name}${i + 1}`)
            }
        });

        const privateSubnet = new aws.ec2.Subnet(getResourceName(`${privateSn.name}${i + 1}`), {
            vpcId,
            cidrBlock: privateSubnetCidr,
            availabilityZone: zones.names[i],
            tags: {
                Name: getResourceName(`${privateSn.name}${i + 1}`)
            }
        });

        publicSubnets.push(publicSubnet);
        privateSubnets.push(privateSubnet);
    }

    return { publicSubnets, privateSubnets };
}
