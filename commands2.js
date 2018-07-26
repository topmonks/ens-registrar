const namehash = require("eth-ens-namehash").hash;

var ens; ENSRegistry.deployed().then(e=>ens=e);
var publicResolver; PublicResolver.deployed().then(e=>publicResolver=e);
var alice = web3.eth.accounts[0];

ens.setSubnodeOwner('0x0', web3.sha3('eth'), alice);
var owner; ens.owner(namehash('eth')).then((r) => { owner = r })
owner === alice


premek = web3.eth.accounts[3]
ens.setSubnodeOwner(namehash('eth'), web3.sha3('premek'), premek);
var owner; ens.owner(namehash('premek.eth')).then((r) => { owner = r })
owner === premek


// bob = web3.eth.accounts[5]
// ens.setSubnodeOwner(namehash('premek.eth'), web3.sha3('bob'), bob, { from: premek });
// var owner; ens.owner(namehash('bob.premek.eth')).then((r) => { owner = r })
// owner === bob


// ens.setSubnodeOwner(namehash('hack.premek.eth'), web3.sha3('bob'), bob, { from: bob });
// ===> Error: VM Exception while processing transaction: revert

// sync = async (func) => { var res; await func.then(e => res = e); console.log(typeof res); return res; }

ens.setResolver(namehash('premek.eth'), publicResolver.address, { from: premek }) // throws an error if done as anybody else than premek
var premekResolverAddr; ens.resolver(namehash('premek.eth')).then(e=>premekResolverAddr=e)
var premekResolver; PublicResolver.at(premekResolverAddr).then((r)=>premekResolver=r)

premekResolver.setAddr(namehash('premek.eth'), premek, { from: premek })
premekResolver.addr(namehash('premek.eth'))


///////////////////

const namehash = require("eth-ens-namehash").hash; var ens; ENSRegistry.deployed().then(e=>ens=e);
var rootAcc = web3.eth.accounts[0]; var topmonks = web3.eth.accounts[1]; var alice = web3.eth.accounts[2]; var bob = web3.eth.accounts[3];

ens.setSubnodeOwner('0x0', web3.sha3('eth'), rootAcc);
ens.setSubnodeOwner(namehash('eth'), web3.sha3('topmonks'), topmonks);
ens.setSubnodeOwner(namehash('topmonks.eth'), web3.sha3('alice'), alice, { from: topmonks }); // => patri alici
ens.setSubnodeOwner(namehash('topmonks.eth'), web3.sha3('alice'), bob, { from: topmonks }); // => patri bobovi, tzn. lze zmenit nadrazenym nodem



var reg; TopmonksRegistrar.deployed().then(e=>reg=e);
