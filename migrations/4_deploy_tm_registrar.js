const namehash = require("eth-ens-namehash").hash;

const ENS = artifacts.require("ENSRegistry");
const TMRegistrar = artifacts.require("TopmonksRegistrar");

module.exports = async function(deployer) {
  const rootNode = namehash("topmonks.eth");
  await deployer.deploy(TMRegistrar, ENS.address, rootNode);
};
