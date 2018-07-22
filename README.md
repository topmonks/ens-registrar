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

### Run

```
ganache-cli > /dev/null &
truffle compile
truffle migrate
truffle console
Domains.at(Domains.address).lookup("test")
```
