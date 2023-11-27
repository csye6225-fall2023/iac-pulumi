import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const { keyName, serviceAccountName } = config.requireObject("gcp");

export const createServiceAccount = (bucket) => {
    const serviceAccount = new gcp.serviceaccount.Account(serviceAccountName, {
        accountId: serviceAccountName,
        displayName: serviceAccountName,
    });

    const bucketAccess = new gcp.storage.BucketIAMBinding("bucketAccess", {
        bucket: bucket.name,
        role: "roles/storage.objectAdmin",
        members: [pulumi.interpolate`serviceAccount:${serviceAccount.email}`],
    });

    const serviceAccountKey = new gcp.serviceaccount.Key(keyName, {
        serviceAccountId: serviceAccount.id,
    });

    return {
        serviceAccount,
        serviceAccountKey,
    };
}
