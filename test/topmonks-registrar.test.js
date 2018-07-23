const TopmonksRegistrar = artifacts.require("TopmonksRegistrar");
const ENS = artifacts.require("ENSRegistry");
const PublicResolver = artifacts.require("PublicResolver");
const namehash = require("eth-ens-namehash").hash;

contract('TopmonksRegistrar', async (accounts) => {
  var ens;
  var topmonksRegistrar;
  var publicResolver;

  var admin;
  var alice;
  var bob;

  before(async function() {
    ens = await ENS.deployed();
    topmonksRegistrar = await TopmonksRegistrar.deployed();
    // publicResolver = await PublicResolver.deployed();
    publicResolver = await PublicResolver.address;

    admin = await web3.eth.accounts[0];
    alice = await web3.eth.accounts[3];
    bob = await web3.eth.accounts[4];

    await ens.setSubnodeOwner('0x0', web3.sha3('eth'), admin);
    await ens.setSubnodeOwner(namehash('eth'), web3.sha3('topmonks'), topmonksRegistrar.address);
  });

  it("be ownable", async () => {
    const subject = await TopmonksRegistrar.deployed();
    const owner = await subject.owner();

    expect(owner).to.eq(accounts[0]);
  });

  it("is possible to register a domain", async () => {
    await topmonksRegistrar.register(web3.sha3('alice'), namehash('alice.topmonks.eth'), alice);

    domainOwner = await ens.owner(namehash('alice.topmonks.eth'));
    domainResolver = await ens.resolver(namehash('alice.topmonks.eth'));

    expect(domainOwner).to.eq(alice);
    expect(domainResolver).to.eq(publicResolver);
  });

  it("is not possible to register already registered subdomain", async () => {
    await topmonksRegistrar.register(web3.sha3('alice'), namehash('alice.topmonks.eth'), alice);
    await topmonksRegistrar.register(web3.sha3('alice'), namehash('alice.topmonks.eth'), bob);

    // try {
    //   result = await topmonksRegistrar.register(web3.sha3('alice'), namehash('alice.topmonks.eth'), bob);
    //   console.log('jsem tady')
    //   console.log(result)
    //   assert(false);
    // } catch (e) {
    //   console.log(JSON.stringify(e))
    //   expect(e.message).to.eq("hoh");
    // }

    domainOwner = await ens.owner(namehash('alice.topmonks.eth'));

    expect(domainOwner).to.eq(alice);
  });

  // it("subdomain owner can't transfer ownership of his domain");
  //
  // it("contract can transfer ownership of subdomains it owns");
  //
  // it("contract owner can transfer ownership of the root domain");
  //
  // it("contract owner can change root domain resolver");
});
