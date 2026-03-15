// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TestERC20
 * @dev Minimal ERC-20 token with 6 decimals for use in unit tests.
 *      Mints 1 trillion tokens to deployer on construction.
 */
contract TestERC20 is ERC20 {
    constructor() ERC20("Test Token", "TST") {
        _mint(msg.sender, 1e12);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
