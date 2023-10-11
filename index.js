import * as vpcModule from "./infrastructure/vpc.js";
import * as subnetsModule from "./infrastructure/subnets.js";
import * as internetGatewayModule from "./infrastructure/internetGateway.js";
import * as routeTableModule from "./infrastructure/routeTable.js";

const vpc = vpcModule.createVpc();
const { publicSubnets, privateSubnets } = subnetsModule.createSubnets(vpc.id);
const gw = internetGatewayModule.createInternetGateway(vpc.id);
routeTableModule.createRouteTablesAndAssociations(vpc.id, gw.id, publicSubnets, privateSubnets);
