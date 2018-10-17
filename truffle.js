const HdWalletProvider = require('truffle-hdwallet-provider');

module.exports = {

  // Lumir recommends trying to disable optimizer when we get the "out of gas" error
  solc: {
    optimizer: {
      // enabled: true,
      // runs: 200 // indicates how many times the contract is supposed to run.
      /**
       * From https://solidity.readthedocs.io/en/develop/using-the-compiler.html#compiler-input-and-output-json-description
       * Before you deploy your contract, activate the optimizer when compiling using solc --optimize --bin sourceFile.sol.
       * By default, the optimizer will optimize the contract assuming it is called 200 times across its lifetime.
       * If you want the initial contract deployment to be cheaper and the later function executions to be more expensive, set it to --runs=1. 
       * If you expect many transactions and do not care for higher deployment cost and output size, set --runs to a high number.
       */
      enabled: false
    }
  },

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
