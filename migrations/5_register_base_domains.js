const namehash = require("eth-ens-namehash").hash;
const ENS = artifacts.require("ENSRegistry");
const TMRegistrar = artifacts.require("TopmonksRegistrar");

module.exports = async function(deployer, _, accounts) {
  let ens = await ENS.deployed();
  let tm = await TMRegistrar.deployed();

  ens.setSubnodeOwner(namehash(''), web3.sha3("eth"), accounts[1])
    .then(() => {
      ens.setSubnodeOwner(namehash('eth'), web3.sha3("topmonks"), tm.address, { from: accounts[1] });
    })
};
