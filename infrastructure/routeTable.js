import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const routeTableConfig = config.requireObject("route-tables");

export const createRouteTablesAndAssociations = (vpcId, gwId, publicSubnets, privateSubnets) => {

    const publicRouteTable = new aws.ec2.RouteTable(routeTableConfig.public.name, {
        vpcId,
        routes: [{
            cidrBlock: routeTableConfig.public.cidrBlock,
            gatewayId: gwId,
        }],
        tags: {
            Name: routeTableConfig.public.metaName
        }
    });

    const privateRouteTable = new aws.ec2.RouteTable(routeTableConfig.private.name, {
        vpcId,
        tags: {
            Name: routeTableConfig.private.metaName
        }
    });

    // Association
    for (let i = 0; i < 3; i++) {
        new aws.ec2.RouteTableAssociation(`${routeTableConfig.association.public.name}${i}`, {
            subnetId: publicSubnets[i].id,
            routeTableId: publicRouteTable.id,
        });

        new aws.ec2.RouteTableAssociation(`${routeTableConfig.association.private.name}${i}`, {
            subnetId: privateSubnets[i].id,
            routeTableId: privateRouteTable.id,
        });
    }

    return { publicRouteTable, privateRouteTable };
};
