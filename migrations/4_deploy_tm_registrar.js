const namehash = require("eth-ens-namehash").hash;

const ENS = artifacts.require("ENSRegistry");
const PublicResolver = artifacts.require("PublicResolver");
const TMRegistrar = artifacts.require("TopmonksRegistrar");

module.exports = async function(deployer) {
  const rootNode = namehash("topmonks.eth");
  ensAddr = ENS.address;
  resolverAddress = PublicResolver.address;

  await deployer.deploy(TMRegistrar, ensAddr, resolverAddress, rootNode);
};
