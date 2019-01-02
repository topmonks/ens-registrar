module.exports = {
  copyPackages: ['openzeppelin-solidity'],
  skipFiles: ['Migrations.sol', 'TestArtifacts.sol'],

  compileCommand: '../node_modules/.bin/truffle compile',
  testCommand: '../node_modules/.bin/truffle test --network coverage',
};
