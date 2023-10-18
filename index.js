import * as vpcModule from "./infrastructure/vpc.js";
import * as subnetsModule from "./infrastructure/subnets.js";
import * as internetGatewayModule from "./infrastructure/internetGateway.js";
import * as routeTableModule from "./infrastructure/routeTable.js";
import * as aws from "@pulumi/aws";
import { createSecurityGroup } from "./infrastructure/securityGroup.js";
import { createEC2Instance } from "./infrastructure/ec2.js";

const createInfra = (zones) => {
    const vpc = vpcModule.createVpc();
    const { publicSubnets, privateSubnets } = subnetsModule.createSubnets(vpc.id, zones);
    const gw = internetGatewayModule.createInternetGateway(vpc.id);
    routeTableModule.createRouteTablesAndAssociations(vpc.id, gw.id, publicSubnets, privateSubnets);
    const securityGroup = createSecurityGroup(vpc.id);
    createEC2Instance(publicSubnets, securityGroup.id);
}

aws.getRegion({}).then(region => {
    aws.getAvailabilityZones({state: "available"}, {region}).then(zones => {
        createInfra(zones);
    })
})