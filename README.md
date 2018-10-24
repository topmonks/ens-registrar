# ENS Subdomains registar [![Build Status](https://travis-ci.com/topmonks/ens-registrar.svg?branch=master)](https://travis-ci.com/topmonks/ens-registrar) [![codecov](https://codecov.io/gh/topmonks/ens-registrar/branch/master/graph/badge.svg)](https://codecov.io/gh/topmonks/ens-registrar)

This contracts let's anybody register subdomains of domain it owns through simple api. React UI is also provided.

## API

## Deployment
Production application lives on AWS S3 on address ens.topmonks.com
The public bucket address is http://ens.topmonks.com.s3-website.eu-central-1.amazonaws.com
The deployment is done via Travis CI
but it requires that `src/contracts` are under version control. Otherwise we would not have correct `network.address` in the contract files. We could call `truffle compile` from within Travis, but we definitely do not want to deploy from Travis. 
So be very careful with the content of `src/contracts` which you push to master branch.

For some reason the credentials for AWS S3 can not be stored in Travis file, even when they are encrypted, because calling `travis encrypt --add" always generates different value. Which is weird, it should be the same value, when calculated from the same input. For that reason the credentials are stored in Travis as environment variables.

### Deployment to ETH Network
Most often the deployment via Truffle migrate scripts fails when deploying to public testnest. Errors are random, but repeated. But if you try the exact same steps in the truffle console, then it works. It is frustrating, to say the least. So I "migrate manually" but then truffle can not correctly track the deployed migrations. It uses really simple mechanism. Every deployed migration increments the internal counter, so that truffle knows which migration script is the next one. Each migration script must be prefixed with incrementing numbers.

The migration steps which commonly fail are 5-6-7. Which translates to these commands:
- #5: ens.setSubnodeOwner(namehash(''), web3.utils.sha3("eth"), accounts[0])
- #6: ens.setSubnodeOwner(namehash('eth'), web3.utils.sha3("topmonks"), tm.address)
- #7: check that the owner is correctly set

So to perform the manual migration, do this:
- travis console --network [ropsten|rinkeby]
- Steps for #5:
-- const namehash = require("eth-ens-namehash").hash;
-- let ens;
-- ENSRegistry.deployed().then(function(instance) {ens = instance});
-- let accounts = web3.eth.getAccounts();
-- ens.setSubnodeOwner(namehash(''), web3.utils.sha3("eth"), accounts[0]);
-- copy the transaction hash and check its status on [networkname].etherscan.io
- Steps for #6:
-- let tm;
-- TopmonksRegistry.deployed().then(function(instance) {tm = instance});
-- ens.setSubnodeOwner(namehash('eth'), web3.utils.sha3("topmonks"), tm.address);
-- copy the transaction hash and check its status on [networkname].etherscan.io
- Steps for #7:
-- ens.owner(namehash("eth")); // should print some address, if it prints 0x000...000 then the owner is not set
-- ens.owner(namehash("topmonks.eth"));  // should print some address, if it prints 0x000...000 then the owner is not set
- run web:
-- yarn start
-- try to register some subdomain on given network

## Development
### Dependencies

- recent nodejs (`nvm use`) - 10 and above
- truffle framework
- some test ETH node, like [Ganache](https://truffleframework.com/ganache/)
- Infura API Key for deployment to Ropsten (and later to other networks)
- mnemonic from MetaMask (used in deployment to Ropsten)
- you will need to create 2 .js files which are gitignored and contain these keys and mnemonic. The files are named `.mnemonic.js` and `.infura_api_key.js` and must be placed in the root directory. They are read from the `truffle.js` file.
- Example of `.mnemonic.js` is `module.exports = "your mnemonic comes here"`. 
- Example of `.infura_api_key.js` is `module.exports = "API key comes here"`. 

```
npm install -g truffle ganache-cli
```

#### Dependencies on Windows
- Decent console emulator, eg [ConEmu](https://conemu.github.io/)
- try running `npm install` to install project dependencies.
- Most likely you will have problems with `node-gyp`
- you can fix them like this
- (Taken from http://blog.davidjs.com/2018/07/eternal-problem-with-node-gyp-on-windows/)
- Open cmd as Administrator (Otherwise the installation fails, meh)
- run command npm install –global –production windows-build-tools
- This will install Visual Studio Build Tools (yes, I know, there is mismatch in names)
- This will also install Python again as a side-effect (meh)
- run npm rebuild
- re-open cmd and run npm install
- all should be fine now

#### Local setup
1. Install deps with `npm install` in root directory
2. Install UI deps with `yarn install` in web/ directory
3. Start your local eth node and configure in truffle.js (You might need to run `truffle develop` to start the local network)
3. Run `truffle migrate --network [your_network] --reset` (Reset is optional, it will deploy all contracts from scratch)
4. Cd into web/ directory and run `yarn start`

### Troubleshooting
#### Not properly deployed contract 
1. The compiled contracts are stored in `build/contracts` folder as .json files. They contain the address of the deployed contract, as well as ABI and bytecode.
1. There is a symlink pointing there from `web/src/contracts` so we do not have to manually copy it
1. But sometimes the build files are not overwritten by `truffle migrate`
1. Manually deleting these files and running `truffle migrate` again helps

It is possible to turn on verbose logging in Ganage GUI (Requires restart of the network)

Important info from https://www.npmjs.com/package/ethereum-ens
setSubnodeOwner sets the owner of the specified name. The calling account must be the owner of the parent name in order for this call to succeed - for example, to call setSubnodeOwner on 'foo.bar.eth', the caller must be the owner of 'bar.eth'.

#### Error - Incorrect nonce
1. The error description says something like `the tx doesn't have the correct nonce. account has nonce of: 0 tx has nonce of: 18`
1. This is caused by Metamask caching the number of transactions, which gets mapped to nonce.
1. There should be 2 ways to solve it
1. A: Open Metamask / Switch to another network / Switch back
1. B: Open Metamask / Select that account / click Reset button
1. C: Restart ganache / Redeploy all contracts / Then steps in point A

#### False positive insufficient funds
1. Error says something like `sender doesn't have enough funds to send tx. The upfront cost is: 300000000000000000 and the sender's account only has: 0`
1. So far I have no idea how to solve it. The last untried option is restart notebook


## Tests
Test require node.js of version 10 and above. If you are using Node Version Manager, make sure, that correct version is selected.
```
ganache-cli > /dev/null &
truffle test
```

### Test on Windows
1. Open ConEmu with 2 tabs
1. in 1st tab run `ganache-cli`
1. in 2nd tab run `truffle test`
1. If you dont do it, you will not be able to properly kill the ganache-cli process
