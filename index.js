import * as aws from "@pulumi/aws";
import * as vpcModule from "./infrastructure/vpc.js";
import * as subnetsModule from "./infrastructure/subnets.js";
import * as internetGatewayModule from "./infrastructure/internetGateway.js";
import * as routeTableModule from "./infrastructure/routeTable.js";
import * as parameterGroupModule from "./infrastructure/parameterGroup.js";
import * as securityGroupModule from "./infrastructure/securityGroup.js";
import * as ec2Module from "./infrastructure/ec2.js";
import * as rdsModule from "./infrastructure/rds.js";
import * as route53Module from "./infrastructure/route53.js";

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
    const { applicatonSecurityGroup, RDSSecurityGroup } = securityGroupModule.createSecurityGroups(vpc.id); 

    // Create RDS Parameter Group
    const parameterGroupRds = parameterGroupModule.createParameterGroupRds(); 

    // Create RDS
    const database = rdsModule.createRDS(parameterGroupRds.name, RDSSecurityGroup.id, privateSubnets);

    //Create ec2 instance
    const instance = ec2Module.createEC2Instance(publicSubnets, applicatonSecurityGroup.id, database);

    //ceate route 53 record
    const route53 = route53Module.createRecord(instance.publicIp);
}

aws.getRegion({}).then(region => {
    aws.getAvailabilityZones({state: "available"}, {region}).then(zones => {
        createInfra(zones);
    })
})