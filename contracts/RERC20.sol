
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DebitaERC20 is ERC20 {

mapping(address => bool) isAddressOK;

uint s_poolBalance;
address s_owner;

/*
STORAGE --> 20,000 --> 
MEMORY --> MUCHO GAS EFFICIENT --> 100-200
*/

modifier onlyOwner {
 require(s_owner == msg.sender, "Not the owner");
 _;
}

modifier onlyUser {
 require(isAddressOK[msg.sender] == true, "Not the owner");
 _;
}

constructor() ERC20("DEBITA TOKEN", "APP") {
}


function mint(uint amount) public {
    _mint(msg.sender, amount);
}

function MintTokensNew(address newUser) public onlyOwner() {
isAddressOK[newUser] = true;
uint fee = (100 * 5 * 10 ** 18) / 10 * 10 ** 18;
_mint(newUser, 10 * 10 ** 18 - fee);
s_poolBalance += fee;
F();
}

function F() public view returns(uint) {
return s_poolBalance;
}


}