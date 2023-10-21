import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const { family, name} = config.requireObject("rds").parameterGroup;


export const createParameterGroupRds = () => {
   const parameterGroup =  new aws.rds.ParameterGroup(name, {
        family,
        name,
        tags: {
            Name: name,
        },
    });

    return parameterGroup;
}