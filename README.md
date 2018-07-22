# topmonks.eth subdomains registar

### Dependencies

- recent nodejs
- truffle framework
- some test ETH node, like [Ganache](https://truffleframework.com/ganache/)

```
npm install -g truffle ganache-cli
```

### Test

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
