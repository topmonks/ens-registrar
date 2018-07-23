var ganache = require('ganache-cli');

function testProvider() {
  // web3.setProvider(ganache.provider());
  // provider = ganache.provider(
  //   {
  //     accounts: [
  //       { balance: '0x64' },
  //       { balance: '0x64' },
  //       { balance: '0x64' },
  //       { balance: '0x64' },
  //       { balance: '0x64' },
  //       { balance: '0x64' },
  //     ]
  //   });

  provider = ganache.provider({ locked: false });
  // web3.setProvider(provider);

  return provider;
}

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },

    test: {
      provider: testProvider,
      network_id: "test"
    }
  }
};
