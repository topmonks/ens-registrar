const namehash = require("eth-ens-namehash").hash;
const ENS = artifacts.require("ENSRegistry");
const TMRegistrar = artifacts.require("TopmonksRegistrar");
const web3 = require("web3");

module.exports = async function(deployer, _, accounts) {
  let ens = await ENS.deployed();
  let tm = await TMRegistrar.deployed();
  try {
    await ens.setSubnodeOwner(namehash('eth'), web3.utils.sha3("topmonks"), tm.address, { 
        // from: accounts[1], // Why was here second account in a row? And why I see only 1 item in the accounts array?
        from: accounts[0],
        gas: 4000000});
  }      
  catch (err) {
    console.log('Deploy step 6 failed', err);
    throw new Error('Deploy step 6 failed');
  }
};
