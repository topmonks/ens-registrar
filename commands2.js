const namehash = require("eth-ens-namehash").hash;

var ens; ENSRegistry.deployed().then(e=>ens=e);
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
