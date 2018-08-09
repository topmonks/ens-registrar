// I had to move PublicRegistrar deploy into separate migration in order to have `PublicResolver.deployed()` working in truffle console. Don't know why it's needed like this. Also tried async await in the previsou migration but didn't help.. :(

const ENS = artifacts.require("ENSRegistry");
const PublicResolver = artifacts.require("./PublicResolver.sol");

module.exports = async function(deployer) {
  await deployer.deploy(PublicResolver, ENS.address);
};
