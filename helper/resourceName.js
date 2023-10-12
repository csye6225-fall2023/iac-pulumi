import * as pulumi from "@pulumi/pulumi";

export const getResourceName = (name) => {
    return pulumi.getStack() + "-" + name;
}