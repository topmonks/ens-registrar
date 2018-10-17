const namehash = require("eth-ens-namehash").hash;
const ENS = artifacts.require("ENSRegistry");
const web3 = require("web3");

module.exports = async function(deployer, _, accounts) {
  let ens = await ENS.deployed();

  try {
    await ens.setSubnodeOwner(namehash(''), web3.utils.sha3("eth"), accounts[0]);
  }
  catch (err) {
      console.log('Deploy step 5 failed', err);
      throw new Error('Deploy step 5 failed');
  }
};
