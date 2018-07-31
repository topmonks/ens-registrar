const namehash = require("eth-ens-namehash").hash;

const TMRegistrar = artifacts.require("TopmonksRegistrar");
const ENS = artifacts.require("ENSRegistry");
const PublicResolver = artifacts.require("PublicResolver");

contract('TopmonksRegistrar', async (accounts) => {
  const rootNode = namehash("eth");
  const tmNode = namehash("topmonks.eth");
  const contractOwner = accounts[1];

  let ens, resolver, subject;

  describe("register domain", async () => {
    const subdomain = namehash("test.topmonks.eth");

    it("sets address in resolver", async () => {
      ens = await ENS.new();
      resolver = await PublicResolver.new(ens.address);
      subject = await TMRegistrar.new(tmNode, ens.address, resolver.address, { from: contractOwner });
      await ens.setSubnodeOwner('', web3.sha3("eth"), accounts[1]);
      await ens.setSubnodeOwner(rootNode, web3.sha3("topmonks"), subject.address, { from: contractOwner });

      await subject.register(web3.sha3("test"), accounts[3], { from: accounts[3] });

      const addr = await resolver.addr(subdomain);
      console.log('Nastavena adresa: ', addr);
      console.log('Accounts[3]: ', accounts[3]);

      expect(addr).to.eq(accounts[3]);
    });
  });
});
