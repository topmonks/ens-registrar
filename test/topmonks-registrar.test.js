const TopmonksRegistrar = artifacts.require("TopmonksRegistrar");
const ENS = artifacts.require("ENSRegistry");
const PublicResolver = artifacts.require("PublicResolver");
const namehash = require("eth-ens-namehash").hash;

contract('TopmonksRegistrar', async (accounts) => {
  it("be ownable", async () => {
    const subject = await TopmonksRegistrar.deployed();
    const owner = await subject.owner();
    expect(owner).to.eq(accounts[0]);
  });

  it("is possible to register a domain", async () => {
    const ens = await ENS.deployed();
    const topmonksRegistrar = await TopmonksRegistrar.deployed();

    admin = await web3.eth.accounts[0];
    alice = await web3.eth.accounts[3];

    await ens.setSubnodeOwner('0x0', web3.sha3('eth'), admin);
    await ens.setSubnodeOwner(namehash('eth'), web3.sha3('topmonks'), topmonksRegistrar.address);

    // await ens.setSubnodeOwner(namehash('topmonks.eth'), web3.sha3('alice'), alice);
    await topmonksRegistrar.register(web3.sha3('alice'), alice);

    owner = await ens.owner(namehash('alice.topmonks.eth'));

    expect(owner).to.eq(alice);
  });

  // it("is not possible to register already registered subdomain");
  //
  // it("subdomain owner can't transfer ownership of his domain");
  //
  // it("contract can transfer ownership of subdomains it owns");
  //
  // it("contract owner can transfer ownership of the root domain");
  //
  // it("contract owner can change root domain resolver");
});
