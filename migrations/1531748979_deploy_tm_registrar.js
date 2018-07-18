const namehash = require("eth-ens-namehash").hash;

const ENS = artifacts.require("ENSRegistry");
const TMRegistrar = artifacts.require("TopmonksRegistrar");

module.exports = function(deployer) {
  const rootNode = namehash("topmonks.eth");
  deployer.deploy(TMRegistrar, ENS.address, rootNode);
};
