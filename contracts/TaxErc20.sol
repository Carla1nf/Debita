pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DebitaERC20Tax is ERC20 {

constructor() ERC20("DEBITA TOKEN", "Token"){

}

function mint(uint amount) public {
    _mint(msg.sender, amount);
}

function transferFrom(address sender, address recipient, uint amount) override public returns(bool) {
uint tax = 10;
_transfer(sender, recipient, amount - tax);
return true;
}

}