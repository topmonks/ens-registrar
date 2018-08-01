const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545');

const source = require('./contracts/TopmonksRegistrar.json');

class TopmonksRegistrar {
  constructor(address) {
    this.contract = new web3.eth.Contract(source.abi, address);
  }

  register(subdomain, account) {
    let node = web3.utils.sha3(subdomain);

    return this.contract.methods.register(node, account)
      .send({ from: account });
  }

  neco(account) {
    return this.contract.methods.neco()
      .call({ from: account });
  }
}

module.exports = TopmonksRegistrar;
