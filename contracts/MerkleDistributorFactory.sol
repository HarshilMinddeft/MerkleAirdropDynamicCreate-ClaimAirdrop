// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "./MerkleDistributor.sol";

contract MerkleDistributorFactory {
    mapping(address => bool) public deployedContracts;
    address[] public deployedContractsList;
    mapping(address => mapping(address => uint256)) public tokenBalances;
    event MerkleDistributorDeployed(
        address indexed distributor,
        address indexed creator,
        address indexed token
    );

    function createMerkleDistributor(
        address token,
        bytes32 merkleRoot,
        uint256 AirdropAmount
    ) external {
        require(
            IERC20(token).balanceOf(msg.sender) >= AirdropAmount,
            "MerkleDistributor: Insufficient balance"
        );
        require(
            !deployedContracts[token],
            "MerkleDistributor for this token is already deployed"
        );
        IERC20(token).transferFrom(msg.sender, address(this), AirdropAmount);
        MerkleDistributor newDistributor = new MerkleDistributor(
            token,
            merkleRoot,
            AirdropAmount
        );
        IERC20(token).transfer(address(newDistributor), AirdropAmount);
        deployedContracts[token] = true;
        deployedContracts[address(newDistributor)] = true;
        deployedContractsList.push(address(newDistributor));
        tokenBalances[address(newDistributor)][token] = AirdropAmount;
        emit MerkleDistributorDeployed(
            address(newDistributor),
            msg.sender,
            token
        );
    }

    function claim(
        address[] memory distributors,
        address account,
        uint256[] memory amounts,
        bytes32[][] calldata merkleProofs
    ) external {
        require(
            distributors.length == amounts.length &&
                distributors.length == merkleProofs.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < distributors.length; i++) {
            address distributor = distributors[i];
            uint256 amount = amounts[i];
            bytes32[] calldata merkleProof = merkleProofs[i];
            require(
                deployedContracts[distributor],
                "Invalid distributor contract"
            );
            require(
                tokenBalances[distributor][
                    MerkleDistributor(distributor).token()
                ] >= amount,
                "Insufficient token balance for distributor"
            );
            tokenBalances[distributor][
                MerkleDistributor(distributor).token()
            ] -= amount;
            MerkleDistributor(distributor).claim(account, amount, merkleProof);
        }
    }

    function getAllDeployedContracts()
        external
        view
        returns (address[] memory)
    {
        return deployedContractsList;
    }
}

//   function approveTokens(address token, uint256 amount) external {
//          IERC20(token).approve(address(this), amount);
//      }
