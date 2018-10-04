const ENS = artifacts.require("ENSRegistry");

module.exports = async function(deployer, _, accounts) {
  await deployer.deploy(ENS);
};
