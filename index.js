import * as aws from "@pulumi/aws";
import * as vpcModule from "./infrastructure/vpc.js";
import * as subnetsModule from "./infrastructure/subnets.js";
import * as internetGatewayModule from "./infrastructure/internetGateway.js";
import * as routeTableModule from "./infrastructure/routeTable.js";
import * as parameterGroupModule from "./infrastructure/parameterGroup.js";
import * as securityGroupModule from "./infrastructure/securityGroup.js";
import * as ec2Module from "./infrastructure/ec2.js";
import * as rdsModule from "./infrastructure/rds.js";

const createInfra = (zones) => {
    // Create a vpc
    const vpc = vpcModule.createVpc();

    // Create subnets
    const { publicSubnets, privateSubnets } = subnetsModule.createSubnets(vpc.id, zones);

    // Create internet gateway and route tables
    const gw = internetGatewayModule.createInternetGateway(vpc.id);

    // Create route tables and associations
    routeTableModule.createRouteTablesAndAssociations(vpc.id, gw.id, publicSubnets, privateSubnets);

    // Create security groups
    const { applicatonSecurityGroup, RDSSecurityGroup } = securityGroupModule.createSecurityGroup(vpc.id); 

    // Create RDS Parameter Group
    const parameterGroupRds = parameterGroupModule.createParameterGroupRds(); 

    // Create RDS
    const database = rdsModule.createRDS(parameterGroupRds.name, RDSSecurityGroup.id, privateSubnets);

    ec2Module.createEC2Instance(publicSubnets, applicatonSecurityGroup.id, database);   
}

aws.getRegion({}).then(region => {
    aws.getAvailabilityZones({state: "available"}, {region}).then(zones => {
        createInfra(zones);
    })
})