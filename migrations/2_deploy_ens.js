const ENS = artifacts.require("ENSRegistry");
const PublicResolver = artifacts.require("./PublicResolver.sol");

module.exports = async function(deployer) {
  await deployer.deploy(ENS);
  // see comment in new migration
  // await deployer.deploy(PublicResolver, ENS.address);
};
