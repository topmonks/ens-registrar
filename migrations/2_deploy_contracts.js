const PublicResolver = artifacts.require("PublicResolver");
const ENS = artifacts.require("ENSRegistry");
const TMRegistrar = artifacts.require("TopmonksRegistrar");
const namehash = require("eth-ens-namehash").hash;
const Web3 = require("web3");

module.exports = async function(deployer, _, accounts) {
  try {
    const config = {
      network: 'ganache_cli', // ganache_cli | ropsten | mainnet
      deployENS: false, // default false
      createResolver: false, // default false
      createRegistrar: false, // default false
      registerDomain: false, // default false. Should be true when we also createRegistrar is true
      registerSubdomain: true, // default true
      
      gasPrice: Web3.utils.toWei('30', 'gwei')
    };

    const addresses = require("../addresses/" + config.network);    

    let ensAddress = addresses.ensAddress;
    let resolverAddress = addresses.resolverAddress;
    let registrarAddress = addresses.registrarAddress;

    /////////////////////////////
    // step 1
    /////////////////////////////
    if (config.deployENS) {
      await deployer.deploy(ENS);

      let ens = await ENS.deployed();
      console.log('ENS.address', ens.address);
      ensAddress = ens.address;

      // Set root subnode owner, seems like requirement (commands.js)
      const ensContract = new web3.eth.Contract(ENS.abi, ensAddress);
      await ensContract.methods
        .setSubnodeOwner(namehash(''), web3.utils.sha3("eth"), accounts[1])
        .send({ from: accounts[0] });
    }

    /////////////////////////////
    // step 2
    /////////////////////////////
    if (config.createResolver) {
      await deployer.deploy(PublicResolver, ensAddress, {
        gas: 4000000,
        from: accounts[0]
      });

      let resolver = await PublicResolver.deployed();
      console.log('PublicResolver.address', resolver.address);
      resolverAddress = resolver.address;
    }    

    /////////////////////////////
    // step 3
    /////////////////////////////
    if (config.createRegistrar) {
      // pass constructor arguments to TMRegistrar
      await deployer.deploy(
        TMRegistrar,
        namehash("topmonks.eth"),
        ensAddress,
        resolverAddress,
        { 
          // from: accounts[0],
          from: accounts[1], // "1" is used in commands.js which works
          gas: 4000000,
          gasPrice: config.gasPrice
        }
      );

      let registrar = await TMRegistrar.deployed();
      registrarAddress = registrar.address
      console.log('TM Registrar.address', registrar.address);
    }

    /////////////////////////////
    // step 4 - register topmonks eth domain
    /////////////////////////////

    if (config.registerDomain) {
      console.log('registering domain topmonks.eth');
      let ens = new web3.eth.Contract(ENS.abi, ensAddress);
      await ens.methods
        .setSubnodeOwner(namehash('eth'), web3.utils.sha3("topmonks"), registrarAddress)
        .send({ 
          // from: accounts[1], // Why was here second account in a row? And why I see only 1 item in the accounts array?
          from: accounts[1],
          gas: 4000000,
          gasPrice: config.gasPrice
      });
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
        registrarAddress
      });

      const testDomain = 'a' + (new Date()).getTime().toString();
      const fullname = testDomain + '.topmonks.eth';
      console.log('testDomain', testDomain, 'fullname', fullname);
  
      const hashedDomain = web3.utils.sha3(testDomain);
      console.log('hashedDomain', hashedDomain);
  
      // Note: It should not matter if I use the "already deployed contract" or "contract from address" approach
      const tmRegistrarContract = new web3.eth.Contract(TMRegistrar.abi, registrarAddress);
      const ensContract = new web3.eth.Contract(ENS.abi, ensAddress);
      console.log('contract tmRegistrarContract', tmRegistrarContract.options.address);
  
      const gasPrice = Web3.utils.toWei('60', 'gwei');
      // Note: we register just he subdomain name -- web3.utils.sha3(subdomain)
      // then we ask for the fullname -- ens.owner(subdomain.domain.eth)
  
      const subdomainOwnerAddress = accounts[1];
      console.log('tmRegistrarContract.methods.register', tmRegistrarContract.methods.register);
      // console.log('tmRegistrarContract.methods.register()', tmRegistrarContract.methods.register(hashedDomain, accounts[0]));
      console.log('my account is', accounts[0], subdomainOwnerAddress);
  
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
