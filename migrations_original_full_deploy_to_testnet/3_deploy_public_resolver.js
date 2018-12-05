const ENS = artifacts.require("ENSRegistry");
const PublicResolver = artifacts.require("PublicResolver");

module.exports = async function(deployer, _, accounts) {

  try {
    await deployer.deploy(PublicResolver, ENS.address, {
      gas: 4000000,
      from: accounts[0]
     }); 
  } catch (error) {
    console.log('---------------------------------'); 
    console.log('ERROR: MIGRATION 3 FAILED', error); 
    console.log('---------------------------------');
    throw new Error('Deploy step 3 failed'); 
  }
};
