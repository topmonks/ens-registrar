# ENS Subdomains registar [![Build Status](https://travis-ci.com/topmonks/ens-registrar.svg?branch=master)](https://travis-ci.com/topmonks/ens-registrar) [![codecov](https://codecov.io/gh/topmonks/ens-registrar/branch/master/graph/badge.svg)](https://codecov.io/gh/topmonks/ens-registrar)

This contracts let's anybody register subdomains of domain it owns through simple api. React UI is also provided.

## API

## Deployment

## Development
### Dependencies

- recent nodejs
- truffle framework
- some test ETH node, like [Ganache](https://truffleframework.com/ganache/)

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

#### Test

```
ganache-cli > /dev/null &
truffle test
```

### Test on Windows
1. Open ConEmu with 2 tabs
1. in 1st tab run `ganache-cli`
1. in 2nd tab run `truffle test`
1. If you dont do it, you will not be able to properly kill the ganache-cli process

### Run

```
ganache-cli > /dev/null &
truffle compile
truffle migrate
truffle console
Domains.at(Domains.address).lookup("test")
```
