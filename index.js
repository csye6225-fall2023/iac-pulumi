import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();

const vpcConfig = config.requireObject("vpc");

//Create a VPC
const vpc = new aws.ec2.Vpc(vpcConfig.name, {
    cidrBlock: vpcConfig.cidrBlock,
    tags: {
        Name: vpcConfig.metaName,
    },
});

//Create subnets in your VPC.
//3 public subnets and 3 private subnets, each in a different availability zone in the same region in the same VPC
const subnetNames = config.getObject("subnets").names;
const subnetCidrBlocks = config.getObject("subnets").cidrBlocks;
const availabilityZones = config.getObject("subnets").availabilityZones;
const subnetTags = config.getObject("subnets").tags;

const publicSubnets = [];
const privateSubnets = [];

for (let i = 0; i < 3; i++) {
    const publicSubnet = new aws.ec2.Subnet(subnetNames.public[i], {
        vpcId: vpc.id,
        cidrBlock: subnetCidrBlocks.public[i],
        availabilityZone: availabilityZones.public[i],
        mapPublicIpOnLaunch: true,
        tags: {
            Name: subnetTags.public[i]
        }
    });

    const privateSubnet = new aws.ec2.Subnet(subnetNames.private[i], {
        vpcId: vpc.id,
        cidrBlock: subnetCidrBlocks.private[i],
        availabilityZone: availabilityZones.private[i],
        tags: {
            Name: subnetTags.private[i]
        }
    });

    publicSubnets.push(publicSubnet);
    privateSubnets.push(privateSubnet);
}

//Create Internet Gateway and attach the Internet Gateway to the VPC
const gwConfig = config.requireObject("gw");
const gw = new aws.ec2.InternetGateway(gwConfig.name, {
    vpcId: vpc.id,
    tags: {
        Name: gwConfig.metaName,
    },
});

// public and private route tables
const routeTableConfig = config.requireObject("route-tables")

const publicRouteTable = new aws.ec2.RouteTable(routeTableConfig.public.name, {
    vpcId: vpc.id,
    routes: [{
        cidrBlock: routeTableConfig.public.cidrBlock,
        gatewayId: gw.id,
    }],
    tags: {
        Name: routeTableConfig.public.metaName
    }
});

const privateRouteTable = new aws.ec2.RouteTable(routeTableConfig.private.name, {
    vpcId: vpc.id,
    tags: {
        Name: routeTableConfig.private.metaName
    }
});

//association
for(let i = 0; i < 3; i++) {
    new aws.ec2.RouteTableAssociation(`${routeTableConfig.association.public.name}${i}`, {
        subnetId: publicSubnets[i].id,
        routeTableId: publicRouteTable.id, 
    });

    new aws.ec2.RouteTableAssociation(`${routeTableConfig.association.private.name}${i}`, {
        subnetId: privateSubnets[i].id,
        routeTableId: privateRouteTable.id,
    });
}