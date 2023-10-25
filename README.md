# Pulumi AWS VPC Configuration

This Pulumi project sets up an Amazon Virtual Private Cloud (VPC) in AWS and configures the following components:
- Creates a Virtual Private Cloud (VPC).
- Creates 3 public and 3 private subnets (max), each in a different availability zone in the same region in the same VPC.
- Creates an Internet Gateway resource and attaches it to the VPC.
- Creates a public route table and attaches all public subnets to it.
- Creates a private route table and attaches all private subnets to it.
- Creates a public route in the public route table with the destination CIDR block 0.0.0.0/0 and the internet gateway as the target.
- Creates an rds instance with the mentioned configuration and passes the hostname of the rds as user data to the ec2 instance.
- Creates a security group which is attached to an EC2 instance where the mentioned ami is deployed.

## Prerequisites
- [Node.js and npm](https://nodejs.org/) installed
- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/) installed
- AWS credentials configured (via `aws configure` or environment variables)

## Installation
- run `npm install`
- run `pulumi config set aws:region <your_region>`
- Setup your stack based on example configuration below
- to create the infra, run `pulumi up`
- to destroy the infra, run `pulumi destroy`

## Pulumi Stack Configuration Options

```yaml
config:
  aws:profile: <your_aws_profile>
  aws:region: <your_aws_region>
  gw:
    name: "<your_gateway_name>"
  route-tables:
    privateRt:
      name: "<your_private_route_table_name>"
    publicRt:
      cidrBlock: "<your_public_route_table_cidr_block>"
      name: "<your_public_route_table_name>"
    association:
      privateRt: "<your_private_route_association>"
      publicRt: "<your_public_route_association>"
  vpc:
    cidrBlock: "<your_vpc_cidr_block>"
    name: "<your_vpc_name>"
  subnets:
    maxAvailabilityZones: <your_max_availability_zones>
    publicSn:
      name: "<your_public_subnet_name>"
    privateSn:
      name: "<your_private_subnet_name>"
  security-group:
    applicationSecurityGroup:
      name: "<your_security_group_name>"
      ingressRules:
        - protocol: "<your_protocol>"
          fromPort: "<your_from_port>"
          toPort: "<your_to_port>"
          cidrBlocks: ["<your_ip_v4_cidr>"]
          ipv6CidrBlocks: ["<your_ip_v6_cidr>"]

      egressRules:
        - protocol: "<your_protocol>"
          fromPort: "<your_from_port>"
          toPort: "<your_to_port>"
          cidrBlocks: ["<your_ip_v4_cidr>"]
    rdsSecurityGroup:
      name: "<your_rds_security_group_name>"
      ingressRule:
        protocol: "<your_protocol>"
        fromPort: "<your_from_port>"
        toPort: "<your_to_port>"
  ec2:
    name: "<your_instance_name>"
    instanceType: "<your_instance_type>"
    amiId: "<your_ami_id>"
    keyName: "<your_ssh_key>"
    rootBlockDevice:
      volumeSize: "<your_volume_size>"
      volumeType: "<your_volume_type>"
  rds:
    name: "<your_rds_name>"
    allocatedStorage: "<your_allocated_storage>"
    dbName: "<your_db_name>"
    engine: "<your_db_engine>"
    engineVersion: "<your_db_engine_version>"
    instanceClass: "<your_db_instance_class>"
    storageType: "<your_db_storage_type>"
    username: "<your_db_username>"
    password: "<your_db_password>"
    dialect: "<your_db_dialect>"
    parameterGroup:
      family: "<your_db_parameter_group_family>"
      name: "<your_db_parameter_group_name>"
```
