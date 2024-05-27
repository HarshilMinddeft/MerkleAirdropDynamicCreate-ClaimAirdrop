// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const MerkleDistributorFactory = await ethers.getContractFactory(
    "MerkleDistributorFactory"
  );
  const merkleDistributorFactory = await MerkleDistributorFactory.deploy();

  console.log(
    "MerkleDistributorFactory address:",
    merkleDistributorFactory.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
