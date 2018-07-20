pragma solidity ^0.4.22;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "@ensdomains/ens/contracts/ENS.sol";
import "@ensdomains/ens/contracts/ResolverInterface.sol";

contract TopmonksRegistrar is Ownable {
    bytes32 public rootNode;
    ENS public ens;
    ResolverInterface public resolver;

    constructor(bytes32 _node, address _ensAddr, address _resolverAddr) public {
        rootNode = _node;
        ens = ENS(_ensAddr);
        resolver = ResolverInterface(_resolverAddr);
    }

    function setRootNode(bytes32 _node) public onlyOwner {
        rootNode = _node;
    }

    function setResolver(address _resolverAddr) public onlyOwner {
        resolver = ResolverInterface(_resolverAddr);
    }

    function setNodeOwner(address _newOwner) public onlyOwner {
        ens.setOwner(rootNode, _newOwner);
    }

    function setSubnodeOwner(bytes32 _subnode, address _addr) public onlyOwner {
        ens.setSubnodeOwner(rootNode, _subnode, _addr);
    }

    function register(bytes32 _subnode, address _addr) public {
        ens.setSubnodeOwner(rootNode, _subnode, this);
        bytes32 node = keccak256(abi.encodePacked(rootNode, _subnode));
        ens.setResolver(node, resolver);
        resolver.setAddr(node, _addr);
        ens.setSubnodeOwner(rootNode, _subnode, _addr);
    }
}
