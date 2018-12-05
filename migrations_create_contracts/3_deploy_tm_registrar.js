const namehash = require("eth-ens-namehash").hash;
const addresses = require("../addresses/ropsten");
const TMRegistrar = artifacts.require("TopmonksRegistrar");
const web3 = require("web3");

module.exports = async function(deployer, _, accounts) {

  const ensAddress = addresses.ensAddress;
  const resolverAddress = addresses.publicResolver;
  
  // TODO: Make sure that gas price is not too high
  // average is OK
  const gasPrice = web3.utils.toWei('30', 'gwei');
  console.log(`Step 3, gas price is ${gasPrice}`);

  try {
    // pass constructor arguments to TMRegistrar
    await deployer.deploy(
      TMRegistrar,
      namehash("topmonks.eth"),
      ensAddress,
      resolverAddress,
      { 
        from: accounts[0],
        gas: 4000000,
        gasPrice: gasPrice
       }
    );  
  } catch (error) {
    console.log('---------------------------------'); 
    console.log('ERROR: MIGRATION 3 FAILED', error); 
    console.log('---------------------------------'); 
    throw new Error('Deploy step 3 failed');
  }
};
