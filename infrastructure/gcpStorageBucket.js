import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const { storageBucketName } = config.requireObject("gcp");

// Create a GCP Storage bucket
export const createBucket = () => {
    const bucket = new gcp.storage.Bucket(storageBucketName, {
        location: "US",
        forceDestroy: true,
        versioning: {
            enabled: true,
        },
    });
    return bucket;
}