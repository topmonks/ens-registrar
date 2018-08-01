const namehash = require("eth-ens-namehash").hash;

const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545');
// const web3 = new Web3('ws://127.0.0.1:8545');

const TMRegistrar = require("./build/contracts/TopmonksRegistrar.json");

main = async () => {

  const accounts = await web3.eth.getAccounts();
  const rootNode = namehash("eth");
  const tmNode = namehash("topmonks.eth");
  const contractOwner = accounts[1];
  const address = "0xEf06739814f19c90EB97bc0A13D52a06Af0966d0";

  registrar = new web3.eth.Contract(TMRegistrar.abi, address);

  var res = await registrar.methods.register(web3.utils.sha3("kozicky"), accounts[4])
    .send({ from: accounts[4] });
  console.log(res);

  var result = await registrar.methods.neco()
    .call({ from: accounts[3] });
  console.log('result is ', result);
}

main();
console.log('goob!');
