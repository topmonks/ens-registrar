const HdWalletProvider = require('truffle-hdwallet-provider');

module.exports = {

  compilers: {
    solc: {
      // Trying to fix the compiler mismatch.
      // Travis CI uses v5 even though my package.json specifies v4
      // But v5 is more strict and the code does not compile.
      // I have fixed all errors, but it now complains that "SyntaxError: Source file requires different compiler version"
      version: "^0.4.25"
    }
  },

  solc: {
    // Lumir recommends trying to disable optimizer when we get the "out of gas" error
    optimizer: {
      enabled: true,
      runs: 200 // indicates how many times the contract is supposed to run.
      /**
       * From https://solidity.readthedocs.io/en/develop/using-the-compiler.html#compiler-input-and-output-json-description
       * Before you deploy your contract, activate the optimizer when compiling using solc --optimize --bin sourceFile.sol.
       * By default, the optimizer will optimize the contract assuming it is called 200 times across its lifetime.
       * If you want the initial contract deployment to be cheaper and the later function executions to be more expensive, set it to --runs=1. 
       * If you expect many transactions and do not care for higher deployment cost and output size, set --runs to a high number.
       */
      // enabled: false
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
    mainnet: {
      // must be a thunk, otherwise truffle commands may hang in CI
      provider: () => {
        const mnemonic = require('./.mnemonic');
        const apiKey = require('./.infura_api_key');
        return new HdWalletProvider(mnemonic, "https://mainnet.infura.io/" + apiKey);
      },
      network_id: 1,
      gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
    },
    ropsten: {
      // "provider" is for Infura
      // "host" is for Geth
      // Ropsten is refered to as "testnet" in Geth
      host: "localhost",
      port: 8888, // post is specified in the "geth.exe shortcut on my desktop" - like this "C:\Program Files\Geth\geth.exe" -syncmode light --testnet --rpc --rpcport 8888 --rpcapi db,eth,net,web3,personal
      from: "0x57fE0D17CA12cceD8931742EFd0503488B446AfA", // default account, copied from my MetaMask
      network_id: 3,
      gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
    },
    ropsten_infura: {
      // must be a thunk, otherwise truffle commands may hang in CI
      provider: () => {
        const mnemonic = require('./.mnemonic');
        const apiKey = require('./.infura_api_key');
        return new HdWalletProvider(mnemonic, "https://ropsten.infura.io/" + apiKey);
      },
      network_id: 3,
      gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
    },
    rinkeby: {
      // "provider" is for Infura
      // "host" is for Geth
      host: "localhost",
      port: 9999, // post is specified in the "geth.exe shortcut on my desktop" - like this "C:\Program Files\Geth\geth.exe" -syncmode light --rinkeby --rpc --rpcport 9999 --rpcapi db,eth,net,web3,personal --unlock="0x57fE0D17CA12cceD8931742EFd0503488B446AfA"
      // from: "0x57fE0D17CA12cceD8931742EFd0503488B446AfA", // default account, copied from my MetaMask
      from: "0x4e64447c5932370a377ee10d04359225b86fffaa", // Generated account via "geth account new", I do not have private key
      network_id: 4,      
      gas: 4612388 // Gas limit used for deploys
    },
    rinkeby_infura: {
      provider: () => {
        const mnemonic = require('./.mnemonic');
        const apiKey = require('./.infura_api_key');
        return new HdWalletProvider(mnemonic, "https://ropsten.infura.io/" + apiKey);
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
