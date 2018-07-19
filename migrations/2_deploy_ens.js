const ENS = artifacts.require("ENSRegistry");

module.exports = async function(deployer) {
  await deployer.deploy(ENS);
};
