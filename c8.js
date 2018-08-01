const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545');
const Registrar = require("./web2/src/TopmonksRegistrar.js");

main = async () => {
  const accounts = await web3.eth.getAccounts();
  const address = "0xEf06739814f19c90EB97bc0A13D52a06Af0966d0";

  registrar = new Registrar(address);

  console.log(accounts[3]);
  await registrar.register("shito", accounts[3]);
  var res = await registrar.neco(accounts[3]);

  console.log('lol.topmonks.eth is owned by: ' , res);
}

main();
console.log('goob!');
