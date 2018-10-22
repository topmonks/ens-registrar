const namehash = require("eth-ens-namehash").hash;
const ENS = artifacts.require("ENSRegistry");
const web3 = require("web3");

module.exports = async function(deployer, _, accounts) {
  let ens = await ENS.deployed();

  // Problem. This transaction consistently fails on Ropsten and Rinkeby
  // The error is "Error encountered, bailing. Network state unknown. Review successful transactions manually. replacement transaction underpriced"
  // The issue is discussed here https://github.com/trufflesuite/truffle/issues/750
  // so I will the advice and increase the gas price
  // 
  // TODO: Did it help?

  const gasPrice = web3.utils.toWei('60', 'gwei');
  console.log(`Step 5, gas price is ${gasPrice}`);

  try {
    await ens.setSubnodeOwner(namehash(''), web3.utils.sha3("eth"), accounts[0], { 
      // from: accounts[1], // Why was here second account in a row? And why I see only 1 item in the accounts array?
      from: accounts[0],
      gas: 4000000,
      gasPrice: gasPrice
     });
  }
  catch (error) {
    console.log('---------------------------------'); 
    console.log('ERROR: MIGRATION 5 FAILED', error); 
    console.log('---------------------------------'); 
    throw new Error('Deploy step 5 failed');
  }
};
