const ENS = artifacts.require("ENSRegistry");
const PublicResolver = artifacts.require("PublicResolver");

module.exports = async function(deployer) {

  await deployer.deploy(PublicResolver, ENS.address, {
    gas: 4000000
   });
};
