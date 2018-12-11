const PublicResolver = artifacts.require("PublicResolver");
const ENS = artifacts.require("ENSRegistry");
const TMRegistrar = artifacts.require("TopmonksRegistrar");
const namehash = require("eth-ens-namehash").hash;
const Web3 = require("web3");

module.exports = async function(deployer, _, accounts) {
  try {

    // In order to succesfully register subdomain via TMRegistrar,
    // the owner of TMRegistrar must the same as owner of the "topmonks.eth" domain
    // registered in the public (3rd party for us) ENS Registrar.
    // Then anyone can register subdomain as long as it is not already taken.

    const config = {
      network: 'mainnet', // ganache_cli | ropsten | mainnet
      deployENS: false, // default false. If false, it is read from the addresses/[network].js file
      createResolver: false, // default false. If false, it is read from the addresses/[network].js file
      createTopmonksRegistrar: true, // default false. If false, it is read from the addresses/[network].js file
      // registerTopmonksDomain should be false in all networks except local Ganache. Otherwise it will fail, when already registered
      registerTopmonksDomain: false, // default false. Should be true when we also createTopmonksRegistrar is true. Registers topmonks.eth
      registerSubdomain: false, // default true
      
      gasPrice: Web3.utils.toWei('10', 'gwei'),
      // to simulate that owner of ENS is different than the owner of TM Domain
      ensOwner: accounts[1],
      topmonksAccount: accounts[0]
    };

    const addresses = require("../addresses/" + config.network);    

    let ensAddress = addresses.ensAddress;
    let resolverAddress = addresses.resolverAddress;
    let topmonksRegistrarAddress = addresses.registrarAddress;

    console.log('Accounts are:');
    console.table(accounts);

    /////////////////////////////
    // step 1
    /////////////////////////////
    if (config.deployENS) {
      await deployer.deploy(ENS, {
        from: config.ensOwner
      });

      let ens = await ENS.deployed();
      console.log('ENS.address', ens.address);
      ensAddress = ens.address;

      // Set root subnode owner, seems like requirement (commands.js)
      const ensContract = new web3.eth.Contract(ENS.abi, ensAddress);
      await ensContract.methods
        .setSubnodeOwner(namehash(''), web3.utils.sha3("eth"), config.ensOwner)
        .send({ from: config.ensOwner });

      console.log('ETH root registered');
    }

    /////////////////////////////
    // step 2
    /////////////////////////////
    if (config.createResolver) {
      console.log('Creating topmonks instance of PublicResolver');
      await deployer.deploy(PublicResolver, ensAddress, {
        gas: 4000000,
        // from: config.ensOwner // seems not be available on Ropsten
        from: config.topmonksAccount
      });

      let resolver = await PublicResolver.deployed();
      console.log('PublicResolver created on address', resolver.address);
      resolverAddress = resolver.address;
    }    

    /////////////////////////////
    // step 3
    /////////////////////////////
    if (config.createTopmonksRegistrar) {
      // Docs:
      // A registrar is simply a smart contract that owns a domain, and issues subdomains of that domain to users 
      // that follow some set of rules defined in the contract.
      //
      // Pass constructor arguments to TMRegistrar
      await deployer.deploy(
        TMRegistrar,
        namehash("topmonks.eth"),
        ensAddress,
        resolverAddress,
        { 
          from: config.topmonksAccount,
          gas: 4000000,
          gasPrice: config.gasPrice
        }
      );

      let registrar = await TMRegistrar.deployed();
      topmonksRegistrarAddress = registrar.address
      console.log('TM Registrar.address', registrar.address);
    }

    /////////////////////////////
    // step 4 - register topmonks eth domain
    /////////////////////////////
    if (config.registerTopmonksDomain) {
      console.log('registering domain topmonks.eth');

      let ens = new web3.eth.Contract(ENS.abi, ensAddress);

      // Check if given domain is already registered
      // if it is, then this step will fail
      const ownerOfTopmonksDomain = await ens.methods.owner(namehash('topmonks.eth')).call();
      console.log('Current owner of topmonks.eth is', ownerOfTopmonksDomain);

      if (ownerOfTopmonksDomain.indexOf('0x00000') !== 0) {
        console.log('-------------------------------------------------');
        console.log('domain topmonks.eth is already registered in ENS');
        console.log('Only its owner can call the ens.setSubnodeOwner() and assign the topmonksRegistrarAddress as its owner');
        console.log('-------------------------------------------------');

        if (accounts[0] != ownerOfTopmonksDomain) {
          console.log('Exiting ...');
          throw new Error("Truffle ignores return, throwing Error instead");
          return;
        }
      }
      else {
        // This results in Invalid JUMP in Ropsten even when the domain is actually free.
        // Because we would have to be the actual owners of the eth node.
        const ownerOfEth = await ens.methods.owner(namehash('eth')).call();
        if (ownerOfEth != accounts[1]) {
          console.log('');
          console.log('Can not register domain under the .eth because the owner of .eth is ', ownerOfEth);
          console.log('This because most likely we not on private testnet, but on ', config.network);
          console.log('');

          throw new Error("Truffle ignores return, throwing Error instead");
          return;
        }

        await ens.methods
          .setSubnodeOwner(namehash('eth'), web3.utils.sha3("topmonks"), topmonksRegistrarAddress)
          .send({ 
            from: accounts[0],
            gas: 4000000,
            gasPrice: config.gasPrice
        });
      }

      console.log('Domain topmonks.eth registered');
    }

    /////////////////////////////
    // step 5 - Register subdomain
    /////////////////////////////
    if (config.registerSubdomain) {

      console.table(accounts);

      console.table(config);

      console.table({
        ensAddress,
        resolverAddress,
        topmonksRegistrarAddress
      });

      const testDomain = 'a' + (new Date()).getTime().toString();
      const fullname = testDomain + '.topmonks.eth';
      console.log('testDomain is', testDomain, ' and fullname is', fullname);  
      const hashedDomain = web3.utils.sha3(testDomain);
  
      const tmRegistrarContract = new web3.eth.Contract(TMRegistrar.abi, topmonksRegistrarAddress);
      const ensContract = new web3.eth.Contract(ENS.abi, ensAddress);
      console.log('contract tmRegistrarContract', tmRegistrarContract.options.address);
  
      const gasPrice = Web3.utils.toWei('60', 'gwei');
      // Note: we register just the subdomain name -- web3.utils.sha3(subdomain)
      // then we ask for the fullname -- ens.owner(subdomain.domain.eth)
  
      const subdomainOwnerAddress = accounts[2];
      console.log('my account is', accounts[0], 'the subdomain owner will be', subdomainOwnerAddress);
  
      // For some obscure reason, this transaction reverts
      const txReceipt = await tmRegistrarContract.methods
        .register(hashedDomain, subdomainOwnerAddress)
        .send({
          from: subdomainOwnerAddress,
          gas: 4000000,
          gasPrice: gasPrice
        });
  
      console.log('txReceipt txHash', txReceipt.transactionHash);  
  
      console.log('Test domain registered');
      const ownerFullName = await ensContract.methods.owner(namehash(fullname)).call();
      const ownerShortName = await ensContract.methods.owner(namehash(testDomain)).call();
      // const ownerOfEth = await ensContract.methods.owner(namehash('eth')).call();
      // const ownerOfTopmonks = await ensContract.methods.owner(namehash('topmonks.eth')).call();
      console.log('Owner of fullname is', ownerFullName, 'Owner of short name is', ownerShortName);
      console.log('The account who registered the subdomain is', subdomainOwnerAddress);
    }


  } catch (error) {
    console.log('---------------------------------'); 
    console.log('ERROR: MIGRATION 2 FAILED', error); 
    console.log('---------------------------------');
    throw new Error('Deploy step 2 failed'); 
  }
};
