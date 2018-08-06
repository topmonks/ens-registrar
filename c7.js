const namehash = require("eth-ens-namehash").hash;

const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545');

const TMRegistrar = require("./build/contracts/TopmonksRegistrar.json");
const ENSRegistry = require('./build/contracts/ENSRegistry.json');

main = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log("Ucty jsou");
  console.log(accounts);

  // const ensAddress = "0x1e176145b27DE7d61C75dD32B755DDAfb6c7F93A";
  // ens = new web3.eth.Contract(ENSRegistry.abi, ensAddress);
  // var res = await ens.methods.owner(namehash("monika.topmonks.eth"))
  //   .call();
  // console.log(res);

  const address = "0x3f3B27Aa272B28096284B728C8832dA292f8f1Fa";
  registrar = new web3.eth.Contract(TMRegistrar.abi, address);
  var res = await registrar.methods.register(web3.utils.sha3("kozicky"), namehash("kozicky.topmonks.eth"), accounts[4])
    .send({ from: accounts[4] });
  console.log(res);

  console.log('po kozicky!');
}

main();
