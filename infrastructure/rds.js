import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const rds = config.getObject("rds");

export const createRDS = (parameterGroupName, vpcSecurityGroupId, subnets) => {
    const dbSubnetGroup = new aws.rds.SubnetGroup(`${rds.name}-subnet-group`, {
        subnetIds: [subnets[0].id, subnets[1].id],
    });

    const database = new aws.rds.Instance(rds.name, {
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
        publiclyAccessible: true,
        tags: {
            Name: rds.name,
        }
    });

    return database;
}