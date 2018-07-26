// ganache-cli --mnemonic "$(cat MNEMONIC)"
// truffle migrate --network ganache_cli

main = async () => {
  const namehash = require("eth-ens-namehash").hash;
  const ENS = require('./build/contracts/ENS.json');
  const TopmonksRegistrar = require('./build/contracts/TopmonksRegistrar.json');
  const Web3 = require('web3');
  const web3 = new Web3('http://127.0.0.1:8545');
  const ensAddress = "0xec149fdfda7a838a1b81851bb4ccf9a0c1d07d5a";
  const tmRegistrarAddress = "0x93b518aea388d236b172d6470e229bbd77b3ccc7";

  var accounts = await web3.eth.getAccounts()
  var ens = new web3.eth.Contract(ENS.abi, ensAddress);
  var tmRegistrar = new web3.eth.Contract(TopmonksRegistrar.abi, tmRegistrarAddress);

  var deployer = accounts[0];
  var rootNodeOwner = accounts[9];
  var topmonks = accounts[1];
  var alice = accounts[2];
  var premek = accounts[3];

  owner = await ens.methods.owner(namehash("topmonks.eth")).call();
  console.log('Current topmonks.eth owner is', owner);

  await ens.methods.setSubnodeOwner(namehash(""), web3.utils.sha3("eth"), deployer).send({ from: deployer });
  await ens.methods.setSubnodeOwner(namehash("eth"), web3.utils.sha3("topmonks"), deployer).send({ from: deployer });
  await ens.methods.setSubnodeOwner(namehash("topmonks.eth"), web3.utils.sha3("alice"), alice).send({ from: deployer });

  owner = await ens.methods.owner(namehash("alice.topmonks.eth")).call();
  console.log('Current alice.topmonks.eth owner is', owner);

  await tmRegistrar.methods.register(web3.utils.sha3("premek"), premek).send({ from: premek, gas: '1000000' });
  owner = await ens.methods.owner(namehash("premek.topmonks.eth")).call();
  console.log('Current premek.topmonks.eth owner is', owner);

  console.log('hooray!');
}

main();
