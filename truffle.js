var ganache = require('ganache-cli');

function testProvider() {
  // web3.setProvider(ganache.provider());
  return ganache.provider(
    {
      accounts: [

    });
}

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },

    test: {
      provider: testProvider,
      network_id: "test"
    }
  }
};
