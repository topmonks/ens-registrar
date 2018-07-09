pragma solidity ^0.4.23;

contract Domains {

    mapping (uint => address) private domainToAddress;

    function encodeDomain(string domain) public pure returns (uint) {
        return uint(keccak256(abi.encodePacked(domain)));
    }

    function registerDomain(string domain) public {
        uint encodedDomain = encodeDomain(domain);
        require(domainToAddress[encodedDomain] == 0x0);
        domainToAddress[encodedDomain] = msg.sender;
    }

    function lookup(string domain) public view returns (address) {
        return domainToAddress[encodeDomain(domain)];
    }
}
