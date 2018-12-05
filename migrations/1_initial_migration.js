var Migrations = artifacts.require("./Migrations.sol");

const Web3 = require("web3");
const HdWalletProvider = require('truffle-hdwallet-provider');
const addresses = require("../addresses/ropsten");
const ENS = artifacts.require("ENSRegistry");
const namehash = require("eth-ens-namehash").hash;

module.exports = async function(deployer) {

  // JUST for TEST, can be safely deleted
  // const providerFn = () => {
  //   const mnemonic = require('../.mnemonic');
  //   const apiKey = require('../.infura_api_key');
  //   return new HdWalletProvider(mnemonic, "https://ropsten.infura.io/" + apiKey);
  // }

  // const web3 = new Web3(providerFn());

  // const ensAddress = addresses.ensAddress;
  // const ensContract = new web3.eth.Contract(ENS.abi, ensAddress);

  // console.log('owner method', ensContract.methods.owner);
  // const owner = await ensContract.methods.owner(namehash('1543940593876.topmonks.eth')).call();
  // console.log('Owner is', owner);

  deployer.deploy(Migrations);
};
