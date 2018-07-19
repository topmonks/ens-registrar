pragma solidity ^0.4.22;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./ENS.sol";
import "./PublicResolver.sol";

contract TopmonksRegistrar is Ownable {
    ENS ens;
    PublicResolver resolver;
    bytes32 rootNode;

    constructor(address _ensAddr, address _resolverAddr, bytes32 _node) public {
        ens = ENS(_ensAddr);
        resolver = PublicResolver(_resolverAddr);
        rootNode = _node;
    }

    function register(bytes32 _subnode, bytes32 _node, address _newOwner) public {
        ens.setSubnodeOwner(rootNode, _subnode, this);
        ens.setResolver(_node, resolver);

        ens.setSubnodeOwner(rootNode, _subnode, _newOwner);
    }
}
