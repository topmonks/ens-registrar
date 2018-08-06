pragma solidity ^0.4.18;

import './ENSRegistry.sol';

contract PublicResolver {
    struct Record {
        address addr;
    }

    ENSRegistry ens;

    mapping (bytes32 => Record) records;

    constructor(ENSRegistry ensAddr) public {
        ens = ensAddr;
    }

    function setAddr(bytes32 node, address addr) public {
        records[node].addr = addr;
    }

    function addr(bytes32 node) public view returns (address) {
        return records[node].addr;
    }
}
