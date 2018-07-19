const namehash = require("eth-ens-namehash").hash;

const ENS = artifacts.require("test/fixtures/ENSRegistry");
const PublicResolver = artifacts.require("test/fixtures/PublicResolver");
const TMRegistrar = artifacts.require("TopmonksRegistrar.sol");

module.exports = function(deployer, network, accounts) {
  const tmNode = namehash("topmonks.eth");
  deployer.deploy(TMRegistrar, tmNode, ENS.address, PublicResolver.address);
};
