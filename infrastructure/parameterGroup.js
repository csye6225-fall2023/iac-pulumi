import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { getResourceName } from "../helper/resourceName.js";

const config = new pulumi.Config();
const { family, name} = config.requireObject("rds").parameterGroup;


export const createParameterGroupRds = () => {
   const parameterGroup =  new aws.rds.ParameterGroup(getResourceName(name), {
        family,
        name,
        tags: {
            Name: getResourceName(name),
        },
    });

    return parameterGroup;
}