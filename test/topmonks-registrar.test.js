const TopmonksRegistrar = artifacts.require("TopmonksRegistrar");

contract('TopmonksRegistrar', async (accounts) => {
  it("be ownable", async () => {
    const subject = await TopmonksRegistrar.deployed();
    const owner = await subject.owner();
    expect(owner).to.eq(accounts[0]);
  });
});
