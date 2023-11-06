import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const { policyArn } = config.requireObject("iamroles");

export const createAndAttachEC2role = () => {

    const ec2Role = new aws.iam.Role("roleEC2", {
        assumeRolePolicy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Principal: {
                        Service: "ec2.amazonaws.com",
                    },
                },
            ],
        }),
    });

    new aws.iam.RolePolicyAttachment("ec2RoleAttachment", {
        role: ec2Role.name,
        policyArn,
    });

    const profile = new aws.iam.InstanceProfile("profileEC2", {
        role: ec2Role.name,
    });

    return profile;
}