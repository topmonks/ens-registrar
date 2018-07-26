pragma solidity ^0.4.22;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "./ENS.sol";
import "./ENSRegistry.sol";
// import "./ResolverInterface.sol";
import "./PublicResolver.sol";

contract TopmonksRegistrar is Ownable {
    event addrDebug(string msg, address addr);

    bytes32 public rootNode;
    ENSRegistry public ens;
    PublicResolver public resolver;

    modifier onlyDomainOwner(bytes32 subnode) {
        address currentOwner = ens.owner(keccak256(abi.encodePacked(rootNode, subnode)));
        require(currentOwner == 0 || currentOwner == msg.sender, "Only owner");
        _;
    }

    constructor(bytes32 _node, address _ensAddr, address _resolverAddr) public {
        rootNode = _node;
        ens = ENSRegistry(_ensAddr);
        resolver = PublicResolver(_resolverAddr);
    }

    function setRootNode(bytes32 _node) public onlyOwner {
        rootNode = _node;
    }

    function setResolver(address _resolverAddr) public onlyOwner {
        resolver = PublicResolver(_resolverAddr);
    }

    function setNodeOwner(address _newOwner) public onlyOwner {
        ens.setOwner(rootNode, _newOwner);
    }

    function setSubnodeOwner(bytes32 _subnode, address _addr) public onlyOwner {
        ens.setSubnodeOwner(rootNode, _subnode, _addr);
    }

    function register(bytes32 _subnode, address _addr) public onlyDomainOwner(_subnode) {
        emit addrDebug('msg.sender je:', msg.sender);
        emit addrDebug('this je:', this);

        ens.setSubnodeOwner(rootNode, _subnode, this);
        bytes32 node = keccak256(abi.encodePacked(rootNode, _subnode));
        ens.setResolver(node, resolver);
        resolver.setAddr(node, _addr);
        ens.setSubnodeOwner(rootNode, _subnode, _addr);
    }
}
