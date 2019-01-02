const source = require('../contracts/TopmonksRegistrar.json');

class TopmonksRegistrar {
  constructor(config, networkId) {
    this.config = config;
    this.contract = new config.web3.eth.Contract(source.abi, config.getRegistrarAddress(networkId));
  }

  register(subdomain, account) {
    let node = this.config.web3.utils.sha3(subdomain);

    return this.contract.methods.register(node, account)
      .send({
        // According to https://www.npmjs.com/package/ethereum-ens the caller of setSubnodeOwner() must be owner of the parent domain
        // which means that this method can be only called by the parent domain owner as well (Because of msg.sender)
        from: account,
        gas: '4700000' // This is the max on Ropsten but it still fails
       });
  }

  debugValue() {
    return this.contract.events.DebugValue();
  }
}

module.exports = TopmonksRegistrar;
