pragma solidity ^0.4.23;

contract Name {

    string public name;

    function getName() external view returns (string) {
        return name;
    }

    function setName(string _name) public {
        name = _name;
    }
}
