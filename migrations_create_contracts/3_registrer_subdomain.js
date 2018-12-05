const namehash = require("eth-ens-namehash").hash;
const addresses = require("../addresses/ganache_cli");
const TMRegistrar = artifacts.require("TopmonksRegistrar");
const ENS = artifacts.require("ENSRegistry");
const Web3 = require("web3");
const HdWalletProvider = require('truffle-hdwallet-provider');

module.exports = async function(deployer, _, accounts) {

  // TODO: Register random subdomain for test
  // Then retrieve the address of the owner, check if it is correct

  try {
    const ensAddress = addresses.ensAddress;
    const resolverAddress = addresses.publicResolver;
    const tmRegistrar = addresses.topmonksRegistrar;

    // do not use for ganache :)
    const getRopstenProviderFn = () => {
      const mnemonic = require('../.mnemonic');
      const apiKey = require('../.infura_api_key');
      return new HdWalletProvider(mnemonic, "https://ropsten.infura.io/" + apiKey);
    }

    // const web3 = new Web3(getRopstenProviderFn()); // ROPSTEN
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); // GANACHE-CLI
    const ensContract = new web3.eth.Contract(ENS.abi, ensAddress);

    // TODO: Do I need to call this? Or is the subdomain owner already set?
    // await ens.setSubnodeOwner(namehash('eth'), web3.utils.sha3("topmonks"), tmRegistrar, {
    //   from: accounts[0],
    //   gas: 4000000,
    //   gasPrice: gasPrice
    // });

    const testDomain = 'a' + (new Date()).getTime().toString();
    const fullname = testDomain + '.topmonks.eth';
    console.log('testDomain', testDomain, 'fullname', fullname);

    const hashedDomain = web3.utils.sha3(testDomain);
    console.log('hashedDomain', hashedDomain);

    const tmRegistrarContract = new web3.eth.Contract(TMRegistrar.abi, tmRegistrar);

    console.log('contract tmRegistrarContract', tmRegistrarContract.options.address);

    const gasPrice = Web3.utils.toWei('60', 'gwei');
    // Note: we register just he subdomain name -- web3.utils.sha3(subdomain)
    // then we ask for the fullname -- ens.owner(subdomain.domain.eth)

    console.log('tmRegistrarContract.methods.register', tmRegistrarContract.methods.register);
    // console.log('tmRegistrarContract.methods.register()', tmRegistrarContract.methods.register(hashedDomain, accounts[0]));
    console.log('my account is', accounts[0]);

    // For some obscure reason, this transaction never ends
    const txReceipt = await tmRegistrarContract.methods
      .register(hashedDomain, accounts[0])
      .send({
        from: accounts[0],
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
    console.log('The account who registered the subdomain is', accounts[0]);
    // console.log('owner of eth', ownerOfEth, 'owner of topmonks.eth', ownerOfTopmonks);

    // TODO: If the TMRegistrar already exists, then do not re-create it!
    // pass constructor arguments to TMRegistrar
    //     
  } catch (error) {
    console.log('---------------------------------'); 
    console.log('ERROR: MIGRATION 4 FAILED', error); 
    console.log('---------------------------------'); 
    throw new Error('Deploy step 4 failed');
  }
};
