const HdWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ganache_cli: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {        
        const mnemonic = require('./.mnemonic');
        const apiKey = require('./.infura_api_key');
        return new HdWalletProvider(mnemonic, 'https://ropsten.infura.io/' + apiKey)
      },
      network_id: 3,
      gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
    }
  }
};
