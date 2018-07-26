// ganache-cli --mnemonic "$(cat MNEMONIC)"
// truffle migrate --network ganache_cli

main = async () => {
  const namehash = require("eth-ens-namehash").hash;
  const ENS = require('./build/contracts/ENS.json');
  const TopmonksRegistrar = require('./build/contracts/TopmonksRegistrar.json');
  const Web3 = require('web3');
  const web3 = new Web3('http://127.0.0.1:8545');
  const ensAddress = "0xb6c985f38556cd0555031e8ad0e836a522618cdf";
  const tmRegistrarAddress = "0xa5a695f0001d18234bedd822b8b47093fd43aa1d";

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

  await ens.methods.setSubnodeOwner(namehash(""), web3.utils.sha3("eth"), rootNodeOwner).send({ from: deployer });
  await ens.methods.setSubnodeOwner(namehash("eth"), web3.utils.sha3("topmonks"), topmonks).send({ from: rootNodeOwner });
  await ens.methods.setSubnodeOwner(namehash("topmonks.eth"), web3.utils.sha3("alice"), alice).send({ from: topmonks });

  await tmRegistrar.methods.register(namehash("premek"), premek).send({ from: premek, gas: '1000000' });

  owner = await ens.methods.owner(namehash("alice.topmonks.eth")).call();
  console.log('Current alice.topmonks.eth owner is', owner);
  owner = await ens.methods.owner(namehash("premek.topmonks.eth")).call();
  console.log('Current premek.topmonks.eth owner is', owner);

  console.log('hooray!');
}

main();
