const namehash = require("eth-ens-namehash").hash;
const ENS = artifacts.require("ENSRegistry");

module.exports = async function(deployer, _, accounts) {
  let ens = await ENS.deployed();

  const ethOwner = await ens.owner(namehash("eth"));
  const topmosksOwner = await ens.owner(namehash("topmonks.eth"));
  console.log('the owner of eth should be', accounts[0], 'but it is ', ethOwner);
  console.log('the owner of topmonks.eth should be', accounts[0], 'but it is ', topmosksOwner);
};
