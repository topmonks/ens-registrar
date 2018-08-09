// jak konfigurovat?
const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545');

let config = {
  ensAddress: "0x3eDFf874188f38902D0e59ce5D5956dd3B9C8d4B",
  registrarAddress: "0x63D01636155a0832749c43AbeBA271571d6A8407",
  web3: web3
}

module.exports = config;
