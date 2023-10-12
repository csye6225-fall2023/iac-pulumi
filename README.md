# Pulumi AWS VPC Configuration

This Pulumi project sets up an Amazon Virtual Private Cloud (VPC) in AWS and configures the following components:
- Creates a Virtual Private Cloud (VPC).
- Creates 3 public and 3 private subnets (max), each in a different availability zone in the same region in the same VPC.
- Creates an Internet Gateway resource and attaches it to the VPC.
- Creates a public route table and attaches all public subnets to it.
- Creates a private route table and attaches all private subnets to it.
- Creates a public route in the public route table with the destination CIDR block 0.0.0.0/0 and the internet gateway as the target.

## Prerequisites
- [Node.js and npm](https://nodejs.org/) installed
- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/) installed
- AWS credentials configured (via `aws configure` or environment variables)

## Installation
- run `npm install`
- run `pulumi config set aws:region <your_region>`
- Setup your stack based on example configuration
- to create the infra, run `pulumi up`
- to destroy the infra, run `pulumi destroy`
