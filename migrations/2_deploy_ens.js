const ENS = artifacts.require("ENSRegistry");

module.exports = async function(deployer, _, accounts) {
  try {
    await deployer.deploy(ENS);  
  } catch (error) {
    console.log('---------------------------------'); 
    console.log('ERROR: MIGRATION 2 FAILED', error); 
    console.log('---------------------------------'); 
    throw new Error('Deploy step 2 failed');
  }
};
