const namehash = require("eth-ens-namehash").hash;

const ENS = artifacts.require("ENSRegistry");
const PublicResolver = artifacts.require("PublicResolver");
const TMRegistrar = artifacts.require("TopmonksRegistrar");

module.exports = async function(deployer, _, accounts) {
  await deployer.deploy(
    TMRegistrar,
    namehash("topmonks.eth"),
    ENS.address,
    PublicResolver.address,
    { from: accounts[1] }
  );
};
