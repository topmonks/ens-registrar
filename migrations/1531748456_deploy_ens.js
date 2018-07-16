const namehash = require("eth-ens-namehash").hash;

const ENS = artifacts.require("test/fixtures/ENSRegistry");
const PublicResolver = artifacts.require("test/fixtures/PublicResolver");

module.exports = function(deployer) {
  const rootNode = namehash("eth");
  deployer.deploy(ENS).then(() => {
    deployer.deploy(PublicResolver, ENS.address);
  });
};
