import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { getResourceName } from "../helper/resourceName.js";

const config = new pulumi.Config();
const rds = config.requireObject("rds");

export const createRDS = (parameterGroupName, vpcSecurityGroupId, subnets) => {
    const dbSubnetGroup = new aws.rds.SubnetGroup(getResourceName(`${rds.name}-subnet-group`), {
        subnetIds: [subnets[0].id, subnets[1].id], 
        tags: {
            Name: getResourceName(`${rds.name}-subnet-group`),
        }
    });

    const database = new aws.rds.Instance(getResourceName(rds.name), {
        allocatedStorage: rds.allocatedStorage,
        dbName: rds.dbName,
        engine: rds.engine,
        engineVersion: rds.engineVersion,
        instanceClass: rds.instanceClass,
        storageType: rds.storageType,
        parameterGroupName,
        username: rds.username,
        password: rds.password,
        skipFinalSnapshot: true,
        multiAz: false,
        dbSubnetGroupName: dbSubnetGroup.name,
        vpcSecurityGroupIds: [vpcSecurityGroupId],
        publiclyAccessible: false,
        tags: {
            Name: getResourceName(rds.name),
        }
    });

    return database;
}