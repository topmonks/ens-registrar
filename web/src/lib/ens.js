import { hash as namehash } from "eth-ens-namehash";

const source = require('../contracts/ENSRegistry.json');
const zeroAddr = '0x0000000000000000000000000000000000000000';

export default class Ens {
  constructor(config) {
    this.contract = new config.web3.eth.Contract(source.abi, config.ensAddress);
  }

  isRegistered(domain) {
    let hashedDomain = namehash(domain);

    let result = this.contract.methods.owner(hashedDomain)
      .call()
      .then(owner => owner !== zeroAddr);

    return result;
  }

  isFree(domain) {
    let hashedDomain = namehash(domain);

    let result = this.contract.methods.owner(hashedDomain)
      .call()
      .then(owner => owner === zeroAddr);

    return result;
  }
}
