const namehash = require("eth-ens-namehash").hash;
const ENS = artifacts.require("ENSRegistry");
const TMRegistrar = artifacts.require("TopmonksRegistrar");

module.exports = async function(deployer, _, accounts) {
  console.log('accounts', accounts);
  let ens = await ENS.deployed();
  let tm = await TMRegistrar.deployed();

  ens.setSubnodeOwner(namehash(''), web3.utils.sha3("eth"), accounts[1])
    .then(() => {
      ens.setSubnodeOwner(namehash('eth'), web3.utils.sha3("topmonks"), tm.address, { 
        // from: accounts[1], // Why was here second account in a row? And why I see only 1 item in the accounts array?
        from: accounts[0],
        gas: 4000000});
    })
};
