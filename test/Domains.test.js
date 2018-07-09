const Domains = artifacts.require("./Domains.sol");

contract("Domains", (accounts) => {

	let domains;
	let me = accounts[0];
	let alice = accounts[1];
	let bob = accounts[2];

	beforeEach(async () => {
		domains = await Domains.new();
	});

	it("contract deployed", async () => {
		assert.ok(domains);
	});

	it("can register domain", async () => {
		await domains.registerDomain("test");
		assert.equal(me, await domains.lookup("test"));
	});

	it("unknown domanin fallback address", async () => {
		assert.equal(0x0, await domains.lookup("test"));
	});

	describe("alice has registered domain", () => {
		beforeEach(async () => {
			await domains.registerDomain("alice", {from: alice});
			assert.equal(alice, await domains.lookup("alice"));
		});

		it("lookups to alice address", async () => {
			assert.equal(alice, await domains.lookup("alice"));
		});

		it("can't be hijacked by bob", async () => {
			try {
				await domains.registerDomain("alice", {from: bob});
			} catch (e) {
				assert.ok(e);
			}
			assert.equal(alice, await domains.lookup("alice"));
		});
	});

});
