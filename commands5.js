const namehash = require("eth-ens-namehash").hash;

const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545');
// const web3 = new Web3('ws://127.0.0.1:8545');

const ENSRegistry = require('./build/contracts/ENSRegistry.json');
const PublicResolver = require("./build/contracts/PublicResolver.json");
const TMRegistrar = require("./build/contracts/TopmonksRegistrar.json");

const TopmonksRegistrar = require('./web2/src/TopmonksRegistrar.js');

main = async () => {

  const accounts = await web3.eth.getAccounts()
  const rootNode = namehash("eth");
  const tmNode = namehash("topmonks.eth");
  const contractOwner = accounts[1];

  ens = await (new web3.eth.Contract(ENSRegistry.abi))
    .deploy({ data: ENSRegistry.bytecode })
    .send({ from: accounts[0], gas: '1000000' })

  console.log("ENSRegistry address is ", ens.options.address);

  resolver = await (new web3.eth.Contract(PublicResolver.abi))
    .deploy({ data: PublicResolver.bytecode, arguments: [ens.options.address] })
    .send({ from: accounts[0], gas: '6000000' })

  console.log("Resolver address is ", resolver.options.address);

  registrar = await (new web3.eth.Contract(TMRegistrar.abi))
    .deploy({ data: TMRegistrar.bytecode, arguments: [tmNode, ens.options.address, resolver.options.address] })
    .send({ from: accounts[1], gas: '6000000' })

  console.log("TM Registrar address is ", registrar.options.address);

  await ens.methods.setSubnodeOwner(namehash(''), web3.utils.sha3("eth"), accounts[1])
    .send({ from: accounts[0] });
  await ens.methods.setSubnodeOwner(rootNode, web3.utils.sha3("topmonks"), registrar.options.address)
    .send({ from: accounts[1] })

  console.log('topmonks.eth is owned by: ', await ens.methods.owner(namehash("topmonks.eth")).call());

  await registrar.methods.register(web3.utils.sha3("test"), accounts[3])
    .send({ from: accounts[3], gas: '6000000' });
  console.log('test.topmonks.eth is owned by: ', await ens.methods.owner(namehash("test.topmonks.eth")).call());

  registrar2 = new web3.eth.Contract(TMRegistrar.abi, registrar.options.address);
  await registrar2.methods.register(web3.utils.sha3("monika"), accounts[3])
    .send({ from: accounts[3], gas: '6000000' });
  console.log('monika.topmonks.eth is owned by: ', await ens.methods.owner(namehash("monika.topmonks.eth")).call());

  // registrar3 = new TopmonksRegistrar(registrar.options.address);
  // await registrar3.register('lol', accounts[3]);
  // console.log('lol.topmonks.eth is owned by: ', await ens.methods.owner(namehash("lol.topmonks.eth")).call());
}

main();
console.log('goob!');


// '0x0', '0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0', '0xca35b7d915458ef540ade6068dfe2f44e8fa733c' // musi byt double quotes
// '0x2d2f0498bf774695773cffc0bc0c8a9c48a06ef342ba28bfedc2e43755d0b151', "0x2d2f0498bf774695773cffc0bc0c8a9c48a06ef342ba28bfedc2e43755d0b151", "0x2d2f0498bf774695773cffc0bc0c8a9c48a06ef342ba28bfedc2e43755d0b151"
// "0x2d2f0498bf774695773cffc0bc0c8a9c48a06ef342ba28bfedc2e43755d0b151","0x85d32d7bb414abc2b9e8740ef543eb05d9f46174341e525c88ec957fef33b291","0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"
