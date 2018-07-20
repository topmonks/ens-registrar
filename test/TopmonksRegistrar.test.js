const namehash = require("eth-ens-namehash").hash;

const TMRegistrar = artifacts.require("TopmonksRegistrar");
const ENS = artifacts.require("@ensdomains/ens/contracts/ENSRegistry");
const PublicResolver = artifacts.require("@ensdomains/ens/contracts/PublicResolver");

contract('TopmonksRegistrar', async (accounts) => {
  const rootNode = namehash("eth");
  const tmNode = namehash("topmonks.eth");
  const contractOwner = accounts[1];

  let ens, resolver, subject;
  beforeEach(async () => {
    ens = await ENS.new();
    resolver = await PublicResolver.new(ens.address);
    subject = await TMRegistrar.new(tmNode, ens.address, resolver.address, { from: contractOwner });
    await ens.setSubnodeOwner('0x0', web3.sha3("eth"), accounts[1]);
    await ens.setSubnodeOwner(rootNode, web3.sha3("topmonks"), subject.address, { from: contractOwner });
  })

  it("owns topmonks.eth", async () => {
    const domain = await subject.rootNode();
    expect(domain).to.eq(namehash("topmonks.eth"));
  });

  describe("setResolver", async () => {
    it("sets resolver", async () => {
      const newResolver = await PublicResolver.new(ens.address);
      await subject.setResolver(newResolver.address, { from: contractOwner });
      expect(await subject.resolver()).to.eq(newResolver.address);
    });

    it("not owner throws", async () => {
      const newResolver = await PublicResolver.new(ens.address);
      try {
        await subject.setResolver(newResolver.address, { from: accounts[5] })
        expect("to throw").to.eq(false);
      } catch {
        return
      }
      expect(true).to.eq(false);
    });
  });

  it("set root node", async () => {
    const newNode = namehash("blemc.eth");
    await subject.setRootNode(newNode, { from: contractOwner });
    expect(await subject.rootNode()).to.eq(newNode);
  });

  it("set node owner", async () => {
    expect(await ens.owner(tmNode)).to.eq(subject.address);
    await subject.setNodeOwner(accounts[4], { from: contractOwner });
    expect(await ens.owner(tmNode)).to.eq(accounts[4]);
  });

  it("set subnode owner", async () => {
    const subnode = namehash("mnouk.topmonks.eth");
    await subject.setSubnodeOwner(web3.sha3("mnouk"), accounts[5], { from: contractOwner });
    expect(await ens.owner(subnode)).to.eq(accounts[5]);
  });

  // describe("ownable", async () => {
  //
  // });

  describe("register domain", async () => {
    const subdomain = namehash("test.topmonks.eth");

    beforeEach(async () => {
      await subject.register(web3.sha3("test"), accounts[3], { from: accounts[3] });
    });

    it("sets domain owner", async () => {
      const owner = await ens.owner(subdomain);
      expect(owner).to.eq(accounts[3]);
    });

    it("sets address in resolver", async () => {
      const addr = await resolver.addr(subdomain);
      expect(addr).to.eq(accounts[3]);
    });

    it("doesnt set new owner", async () => {
      try {
        await subject.register(web3.sha3("test"), accounts[4], { from: accounts[4] });
      } catch {
      } finally {
        expect(await resolver.addr(subdomain)).to.eq(accounts[3]);
      }
    });

    it("reverts when already registered", async () => {
      try {
        await subject.register(web3.sha3("test"), accounts[4], { from: accounts[4] });
      } catch (err) {
        expect(err.message).to.have.string("revert");
        return;
      }
      expect("to throw exception").to.eq(false);
    });
  });
});
