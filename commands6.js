const TopmonksRegistrar = require('./web2/src/TopmonksRegistrar.js');
const address = "0x01dFeB7DeB89f35744750F0632618059faa60230";
const registrar = new TopmonksRegistrar(address);

const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

web3.eth.getAccounts()
  .then((accounts) => {
    console.log(accounts[3]);

    registrar.register('hahahahaha', accounts[3])
      .then((receipt) => {
        console.log(receipt);
      })
      .catch((error) => {
        console.log('accounty mam ale nepovedlo se zaregistrovat');
        console.log(error);
      });
  })
  .catch((error) => {
    console.log('nepovedlo se ziskat accounty');
    console.log(error);
  });
