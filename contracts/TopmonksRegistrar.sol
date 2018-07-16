pragma solidity ^0.4.22;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract TopmonksRegistrar is Ownable {
    ENS ens;
    bytes32 rootNode;

    constructor(address _ensAddr, bytes32 _node) public {
        ens = ENS(_ensAddr);
        rootNode = _node;
    }

    function register(byte32 _subnode, address _addr) public {
        byte32 node = keccak256(rootNode, _subnode);
        address currentOwner = ens.owner(node);
        if(currentOwner != 0 && currentOwner != msg.sender)
            revert("not owner");

        ens.setSubnodeOwner(rootNode, subnode, owner);
    }
}
