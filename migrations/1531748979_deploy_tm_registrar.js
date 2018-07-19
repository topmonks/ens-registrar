const namehash = require("eth-ens-namehash").hash;

const TMRegistrar = artifacts.require("TopmonksRegistrar.sol");

module.exports = function(deployer, network, accounts) {
  const tmNode = namehash("topmonks.eth");
  deployer.deploy(TMRegistrar, tmNode, '0x0', '0x0');
};
