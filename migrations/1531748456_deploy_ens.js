const namehash = require("eth-ens-namehash").hash;

const ENS = artifacts.require("ENSRegistry");
const PublicResolver = artifacts.require("PublicResolver");

module.exports = function(deployer) {
  const rootNode = namehash("eth");
  deployer.deploy(ENS).then(() => {
    return deployer.deploy(PublicResolver, ENS.address);
  });
};
