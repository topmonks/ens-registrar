pragma solidity ^0.4.22;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "contracts/ENS.sol";

contract TopmonksRegistrar is Ownable {
    ENS ens;
    bytes32 rootNode;

    constructor(address _ensAddr, bytes32 _node) public {
        ens = ENS(_ensAddr);
        rootNode = _node;
    }

    function setRootNode(bytes32 _node) public onlyOwner {
        rootNode = _node;
    }

    function register(bytes32 _subnode, address _addr) public {
        bytes32 node = keccak256(rootNode, _subnode);
        address currentOwner = ens.owner(node);
        if(currentOwner != 0 && currentOwner != msg.sender)
            revert("not owner");

        ens.setSubnodeOwner(rootNode, _subnode, owner);
    }
}
