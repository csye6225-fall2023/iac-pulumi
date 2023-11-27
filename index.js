import * as aws from "@pulumi/aws";
import * as vpcModule from "./infrastructure/vpc.js";
import * as subnetsModule from "./infrastructure/subnets.js";
import * as internetGatewayModule from "./infrastructure/internetGateway.js";
import * as routeTableModule from "./infrastructure/routeTable.js";
import * as parameterGroupModule from "./infrastructure/parameterGroup.js";
import * as securityGroupModule from "./infrastructure/securityGroup.js";
import * as ec2TemplateModule from "./infrastructure/ec2LaunchTemplate.js";
import * as rdsModule from "./infrastructure/rds.js";
import * as iamrolesModule from "./infrastructure/iamroles.js";
import * as route53Module from "./infrastructure/route53.js";
import * as autoScalingGroupModule from "./infrastructure/autoScalingGroup.js";
import * as loadBalancerModule from "./infrastructure/loadBalancer.js";
import * as snsModule from "./infrastructure/snsTopic.js";
import * as gcpStorageBucketModule from "./infrastructure/gcpStorageBucket.js";
import * as gcpServiceAccountModule from "./infrastructure/gcpServiceAccount.js";
import * as dynamoDBModule from "./infrastructure/dynamoDB.js";
import * as lambdaModule from "./infrastructure/lambda.js";

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
    const { applicatonSecurityGroup, RDSSecurityGroup, loadBalancerSecurityGroup } = securityGroupModule.createSecurityGroups(vpc.id); 

    // Create RDS Parameter Group
    const parameterGroupRds = parameterGroupModule.createParameterGroupRds(); 

    // Create RDS
    const database = rdsModule.createRDS(parameterGroupRds.name, RDSSecurityGroup.id, privateSubnets);

    // Create Roles
    const { profile, ec2Role } = iamrolesModule.createAndAttachEC2role();

    //create load balancer
    const {loadBalancer, targetGroup} = loadBalancerModule.createLoadBalancer(publicSubnets.map(subnet => subnet.id), loadBalancerSecurityGroup, vpc.id);

    //create sns topic
    const sns = snsModule.createSnsTopic(ec2Role);

    //create launch template
    const launchTemplate = ec2TemplateModule.createLaunchTemplate(applicatonSecurityGroup.id, database, profile, sns);

    //create autoscaling group
    const asg = autoScalingGroupModule.createAutoScalingGroup(launchTemplate, publicSubnets.map(subnet => subnet.id), targetGroup);

    //ceate route 53 record
    const route53 = route53Module.createRecord(loadBalancer);

    //create gcp storage bucket
    const bucket = gcpStorageBucketModule.createBucket();

    //create service account
    const {serviceAccount, serviceAccountKey} = gcpServiceAccountModule.createServiceAccount(bucket);

    //create lambda role
    const lambdaRole = lambdaModule.createLambdaRole();

    //create dynamodb table
    const table = dynamoDBModule.createDynamoDBTable(lambdaRole);

    //create lambda function
    const lambda = lambdaModule.createLambda(serviceAccountKey.privateKey, bucket.name, table.name, sns, lambdaRole);
}

aws.getRegion({}).then(region => {
    aws.getAvailabilityZones({state: "available"}, {region}).then(zones => {
        createInfra(zones);
    })
})