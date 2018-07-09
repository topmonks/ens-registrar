var Name = artifacts.require("./Name.sol");
var Domains = artifacts.require("./Domains.sol");

module.exports = function(deployer) {
	deployer.deploy(Name);
	deployer.deploy(Domains);
};
