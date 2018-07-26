const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545');

  web3.eth.getAccounts()
    .then((result) => {
      console.log('good');
      console.log(result);
    }).catch((result) => {
      console.log('bad');
    });

main = async () => {
  var accounts = await web3.eth.getAccounts();
  console.log(accounts);
}

main();

// console.log(accounts);
