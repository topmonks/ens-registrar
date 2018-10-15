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
        // using process.env.MNENOMIC would be safer, but this is test project
        const mnemonic = require('./.mnemonic');
        const apiKey = require('./.infura_api_key');
        return new HdWalletProvider(mnemonic, 'https://ropsten.infura.io/' + apiKey);
      },
      network_id: 3,
      gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
    },
    rinkeby: {
      provider: function() {        
        // using process.env.MNENOMIC would be safer, but this is test project
        const mnemonic = require('./.mnemonic');
        const apiKey = require('./.infura_api_key');
        return new HdWalletProvider(mnemonic, 'https://rinkeby.infura.io/' + apiKey);
      },
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
    },
    // Getting KETH Requires SMS verification 
    kovan: {
      provider: function() {
        // using process.env.MNENOMIC would be safer, but this is test project
        const mnemonic = require('./.mnemonic');
        const apiKey = require('./.infura_api_key');
        return new HdWalletProvider(mnemonic, "https://kovan.infura.io/" + apiKey);
      },
      network_id: 42,
      gas: 3000000,
      gasPrice: 21
    },
  }
};
