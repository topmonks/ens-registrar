const namehash = require("eth-ens-namehash").hash;

const ENS = artifacts.require("ENSRegistry");
const PublicResolver = artifacts.require("PublicResolver");
const TMRegistrar = artifacts.require("TopmonksRegistrar");
const web3 = require("web3");

console.log(' ');
console.log('Check the address');
console.log('ENS', ENS.address);
console.log('PublicResolver', PublicResolver.address);
console.log(' ');

module.exports = async function(deployer, _, accounts) {

  console.log('accounts step 4', accounts);
  
  const gasPrice = web3.utils.toWei('60', 'gwei');
  console.log(`Step 4, gas price is ${gasPrice}`);

  try {
    await deployer.deploy(
      TMRegistrar,
      namehash("topmonks.eth"),
      ENS.address,
      PublicResolver.address,
      { 
        // from: accounts[1], // Why was here second account in a row? And why I see only 1 item in the accounts array?
        from: accounts[0],
        gas: 4000000,
        gasPrice: gasPrice
       }
    );  
  } catch (error) {
    console.log('---------------------------------'); 
    console.log('ERROR: MIGRATION 4 FAILED', error); 
    console.log('---------------------------------'); 
    throw new Error('Deploy step 4 failed');
  }
};
