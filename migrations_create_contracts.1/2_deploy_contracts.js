const PublicResolver = artifacts.require("PublicResolver");
const ENS = artifacts.require("ENSRegistry");
const addresses = require("../addresses/ropsten");

module.exports = async function(deployer, _, accounts) {
  try {
    let ensAddress = addresses.ensAddress;
    let resolverAddress = addresses.resolverAddress;

    // For Ganache - Deploy ENS first
    const config = {
      deployENS: true, // default false
      createResolver: true, // default false
      createRegistrar: true // default true
    };

    if (config.deployENS) {
      await deployer.deploy(ENS);

      let ens = await ENS.deployed();
      console.log('ENS.address', ens.address);
      ensAddress = ens.address;
    }

    if (config.createResolver) {
      await deployer.deploy(PublicResolver, ensAddress, {
        gas: 4000000,
        from: accounts[0]
      });

      let resolver = await PublicResolver.deployed();
      console.log('PublicResolver.address', resolver.address);
      resolverAddress = resolver.address;
    }
    
    if (config.createRegistrar) {
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

      let registrar = await TMRegistrar.deployed();
      console.log('TM Registrar.address', registrar.address);
    }
  } catch (error) {
    console.log('---------------------------------'); 
    console.log('ERROR: MIGRATION 2 FAILED', error); 
    console.log('---------------------------------');
    throw new Error('Deploy step 2 failed'); 
  }
};
