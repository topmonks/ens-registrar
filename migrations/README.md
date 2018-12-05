# Migrations to MainNet

## Registrar address
See docs https://docs.ens.domains/en/latest/introduction.html#ens-on-ethereum
The Mainnet registrar is on address `0x314159265dd8dbb310642f98f50c066173c1259b`

The test registrar on Ropten is on address `0x112234455c3a32fd11230c42e7bccd4a84e02010`

## Steps to deploy
1. **OTESTOVAT SI SPRÁVNOST KROKŮ NA TESTNETU NEJPRVE!**
1. Deploy PublicResolver for TopMonks
1. Deploy Topmonks Registrar (requires ENSAddress from above and address of PublicResolver)
1. Register some test subdomain, `testik.topmonks.eth`
1. Test that the address is resolved via `await ens.owner(namehash("testik.topmonks.eth"))`


Ropsten test data
ENS `0x7a173ce4692b0c448754929c25b29522e3ed7695`
PublicResolver `0xc9c9bef22c378f841419ba6ad38f9f98e38ec70e`
TopmonksRegistrar: `0x226c3524b57312a03805f753e50f4ad12f39112f`

## TODO
`truffle migrate` umí pracovat jen s jednou složkou a to `migrations`. **Takže pro tyto pokusy je nutné složky přejmenovat!**

**A jéje, vypadá to, že reverse_lookup nemáme implementovaný. Takže to se bude muset ještě dodělat.**