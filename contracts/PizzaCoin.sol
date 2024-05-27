// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//Contract should be Ownable so supply will be minted to owner i have removed it because of CompilerVersion error
// Ownable is nesessary
contract PuffCoin is ERC20 {
    constructor() ERC20("PuffCoin", "PUF") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
