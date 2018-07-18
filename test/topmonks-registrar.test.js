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

  it("is possible to register a domain", async (accounts) => {
    const ens = await ENS.deployed();
    const resolver = await PublicResolver.deployed();

    owner = await resolver.addr(namehash('myname.test'));
    alice = accounts[3];


    expect(owner).to.eq(alice);
  });

  it("is not possible to register already registered subdomain");

  it("subdomain owner can't transfer ownership of his domain");

  it("contract can transfer ownership of subdomains it owns");

  it("contract owner can transfer ownership of the root domain");

  it("contract owner can change root domain resolver");
});
