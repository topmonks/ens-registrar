pragma solidity ^0.4.18;

contract ENSRegistry {
    struct Record {
        address owner;
        address resolver;
    }

    mapping (bytes32 => Record) records;

    constructor() public {
        records[0x0].owner = msg.sender;
    }

    function setSubnodeOwner(bytes32 node, bytes32 label, address owner) public {
        bytes32 subnode = keccak256(abi.encodePacked(node, label));
        records[subnode].owner = owner;
    }

    function setResolver(bytes32 node, address resolver) public {
        records[node].resolver = resolver;
    }

    function owner(bytes32 node) public view returns (address) {
        return records[node].owner;
    }
}
