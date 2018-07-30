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
      await ens.setSubnodeOwner('0x0', web3.sha3("eth"), accounts[1]);
      await ens.setSubnodeOwner(rootNode, web3.sha3("topmonks"), subject.address, { from: contractOwner });

      // var addrDebug = subject.addrDebug();
      // addrDebug.watch((err, result) => {
      //   console.log(result.args.msg, result.args.addr);
      // });
      // var addrDebug2 = resolver.addrDebug();
      // addrDebug2.watch((err, result) => {
      //   console.log(result.args.msg, result.args.addr);
      // });

      console.log('accounts[3] je:', accounts[3]);
      await subject.register(web3.sha3("test"), accounts[3], { from: accounts[3] });

      const addr = await resolver.addr(subdomain);
      expect(addr).to.eq(accounts[3]);
    });
  });
});
