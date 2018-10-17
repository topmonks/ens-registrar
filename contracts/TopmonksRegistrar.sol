pragma solidity ^0.4.22;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../lib/ENS.sol";
import "../lib/ResolverInterface.sol";

contract TopmonksRegistrar is Ownable {
    bytes32 public rootNode;
    ENS public ens;
    ResolverInterface public resolver;

    event DebugValue(uint _step);

    modifier onlyDomainOwner(bytes32 subnode) {
        address currentOwner = ens.owner(keccak256(abi.encodePacked(rootNode, subnode)));
        require(currentOwner == 0 || currentOwner == msg.sender, "Only owner");
        _;
    }

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

    function register(bytes32 _subnode, address _addr) public onlyDomainOwner(_subnode) {
        // Using "event DebugValue" to track progress of failing transaction
        // I want to check how far I get when it fails with "out of gas" exception
        emit DebugValue(0);
        ens.setSubnodeOwner(rootNode, _subnode, this);
        emit DebugValue(1);
        bytes32 node = keccak256(abi.encodePacked(rootNode, _subnode));
        emit DebugValue(2);
        ens.setResolver(node, resolver);
        emit DebugValue(3);
        resolver.setAddr(node, _addr);
        emit DebugValue(4);
        ens.setSubnodeOwner(rootNode, _subnode, _addr);
        emit DebugValue(5);
    }
}
