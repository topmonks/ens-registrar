# ENS Subdomains registar [![Build Status](https://travis-ci.com/topmonks/ens-registrar.svg?branch=master)](https://travis-ci.com/topmonks/ens-registrar) [![codecov](https://codecov.io/gh/topmonks/ens-registrar/branch/master/graph/badge.svg)](https://codecov.io/gh/topmonks/ens-registrar)

This contracts let's anybody register subdomains of domain it owns through simple api. React UI is also provided.

## API

## Deployment

## Development
### Dependencies

- recent nodejs (`nvm use`)
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
