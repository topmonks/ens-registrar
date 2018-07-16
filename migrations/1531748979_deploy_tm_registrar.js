const namehash = require("eth-ens-namehash").hash;

const ENS = artifacts.require("test/fixtures/ENSRegistry");
const TMRegistrar = artifacts.require("TopmonksRegistrar.sol");

module.exports = function(deployer) {
  const rootNode = namehash("topmonks.eth");
  deployer.deploy(TMRegistrar, ENS.address, rootNode);
};
