pragma solidity ^0.4.22;

import "./ENSRegistry.sol";
import "./PublicResolver.sol";

contract TopmonksRegistrar {
    bytes32 public rootNode;
    ENSRegistry public ens;
    PublicResolver public resolver;

    constructor(bytes32 _node, address _ensAddr, address _resolverAddr) public {
        rootNode = _node;
        ens = ENSRegistry(_ensAddr);
        resolver = PublicResolver(_resolverAddr);
    }

    function register(bytes32 _subnode, bytes32 _node, address _addr) public {
        ens.setSubnodeOwner(rootNode, _subnode, this);
        ens.setResolver(_node, resolver.address);
        // resolver.setAddr(_node, _addr);
        ens.setSubnodeOwner(rootNode, _subnode, _addr);
    }
}
