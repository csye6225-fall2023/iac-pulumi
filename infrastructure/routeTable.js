import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { getResourceName } from "../helper/resourceName.js";

const config = new pulumi.Config();
const { privateRt, publicRt, association } = config.requireObject("route-tables");

export const createRouteTablesAndAssociations = (vpcId, gwId, publicSubnets, privateSubnets) => {

    const publicRouteTable = new aws.ec2.RouteTable(getResourceName(publicRt.name), {
        vpcId,
        routes: [{
            cidrBlock: publicRt.cidrBlock,
            gatewayId: gwId,
        }],
        tags: {
            Name: getResourceName(publicRt.name)
        }
    });

    const privateRouteTable = new aws.ec2.RouteTable(getResourceName(privateRt.name), {
        vpcId,
        tags: {
            Name: getResourceName(privateRt.name)
        }
    });

    // Association
    for (let i = 0; i < publicSubnets.length; i++) {
        new aws.ec2.RouteTableAssociation(getResourceName(`${association.publicRt}${i + 1}`), {
            subnetId: publicSubnets[i].id,
            routeTableId: publicRouteTable.id,
        });

        new aws.ec2.RouteTableAssociation(getResourceName(`${association.privateRt}${i + 1}`), {
            subnetId: privateSubnets[i].id,
            routeTableId: privateRouteTable.id,
        });
    }

    return { publicRouteTable, privateRouteTable };
};
