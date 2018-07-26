const namehash = require("eth-ens-namehash").hash;

const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545');
// const web3 = new Web3('ws://127.0.0.1:8545');

const ENS = require('./build/contracts/ENSRegistry.json');
const PublicResolver = require("./build/contracts/PublicResolver.json");
const TMRegistrar = require("./build/contracts/TopmonksRegistrar.json");

main = async () => {

  const accounts = await web3.eth.getAccounts()
  const rootNode = namehash("eth");
  const tmNode = namehash("topmonks.eth");
  const contractOwner = accounts[1];

  ens = await (new web3.eth.Contract(ENS.abi))
    .deploy({ data: ENS.bytecode })
    .send({ from: accounts[0], gas: '1000000' })

  resolver = await (new web3.eth.Contract(PublicResolver.abi))
    .deploy({ data: PublicResolver.bytecode, arguments: [ens.options.address] })
    .send({ from: accounts[0], gas: '6000000' })

  registrar = await (new web3.eth.Contract(TMRegistrar.abi))
    .deploy({ data: TMRegistrar.bytecode, arguments: [tmNode, ens.options.address, resolver.options.address] })
    .send({ from: accounts[1], gas: '6000000' })
  // registrar.events.addrDebug({}, (error, event) => {
  //   console.log(event)
  // });

  console.log('ens: ', ens.options.address);
  console.log('resolver: ', resolver.options.address);
  console.log('registrar: ', registrar.options.address);

  await ens.methods.setSubnodeOwner(namehash(''), web3.utils.sha3("eth"), accounts[1])
    .send({ from: accounts[0] });
  await ens.methods.setSubnodeOwner(rootNode, web3.utils.sha3("topmonks"), registrar.options.address)
    .send({ from: accounts[1] })

  console.log('topmonks.eth is owned by: ', await ens.methods.owner(namehash("topmonks.eth")).call());

  const subdomain = namehash("test.topmonks.eth");
  await registrar.methods.register(web3.utils.sha3("test"), accounts[3])
    .send({ from: accounts[3] });

  console.log('test.topmonks.eth is owned by: ', await ens.methods.owner(subdomain).call());
}

main();
console.log('goob!');
