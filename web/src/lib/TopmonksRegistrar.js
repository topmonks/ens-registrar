const source = require('../contracts/TopmonksRegistrar.json');

export default class TopmonksRegistrar {
  constructor(config, networkId) {
    this.config = config;
    this.contract = new config.web3.eth.Contract(source.abi, config.getRegistrarAddress(networkId));
  }

  async register(subdomain, address, options = {}) {
    const node = this.config.web3.utils.sha3(subdomain);
    const account = options.from || this.config.web3.defaultAccount;

    const gasPrices = await this.config.getCurrentGasPrices();
    const estimatedGas = await this.contract.methods
      .register(node, address)
      .estimateGas({ from: account });

    debugger;
    return this.contract.methods.register(node, address)
      .send({
        gasPrice: gasPrices.medium * 1000000000, // convert from gwei to wei
        gas: estimatedGas + 500000, // Add some gas if it costs more
        from: account,
       });
  }

  debugValue() {
    return this.contract.events.DebugValue();
  }
}
