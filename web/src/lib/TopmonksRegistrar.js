const source = require('../contracts/TopmonksRegistrar.json');

class TopmonksRegistrar {
  constructor(config) {
    this.config = config;
    this.contract = new config.web3.eth.Contract(source.abi, config.registrarAddress);
  }

  register(subdomain, account) {
    let node = this.config.web3.utils.sha3(subdomain);

    return this.contract.methods.register(node, account)
      .send({ from: account, gas: '6000000' });
  }
}

module.exports = TopmonksRegistrar;
