const { MerkleTree } = require("merkletreejs");
const KECCAK256 = require("keccak256");
const { BigNumber } = require("ethers");
const fs = require("fs").promises;

async function main() {
  [signer1, signer2, signer3] = await ethers.getSigners();
  const customAddress1 = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
  signer3 = { address: customAddress1 };

  walletAddresses = [signer1, signer2, signer3].map((s) => s.address);

  leaves = walletAddresses.map((x) => KECCAK256(x));
  tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });
  PuffCoin = await ethers.getContractFactory("PuffCoin", signer1);
  token = await PuffCoin.deploy();
  MerkleDistributor = await ethers.getContractFactory(
    "MerkleDistributor",
    signer1
  );

  distributor = await MerkleDistributor.deploy(
    token.address,
    tree.getHexRoot()
  );

  await token
    .connect(signer1)
    .mint(distributor.address, BigNumber.from("20000000000000000000"));

  // Dropped amount
  await distributor
    .connect(signer1)
    .setDropAmount(signer1.address, BigNumber.from("4000000000000000000"));
  await distributor
    .connect(signer1)
    .setDropAmount(signer2.address, BigNumber.from("2000000000000000000"));
  await distributor
    .connect(signer1)
    .setDropAmount(signer3.address, BigNumber.from("5000000000000000000"));

  console.log("PuffCoin:", token.address);
  console.log("MerkleDistributor:", distributor.address);
  console.log("signer1:", signer1.address);
  console.log("Addresses", walletAddresses);
  const merkleRoot = tree.getHexRoot();

  // Print the 32-byte Merkle root
  console.log("32-byte Merkle root:", merkleRoot);
  //This will put all address in json file for frontend
  const indexedAddresses = {};
  walletAddresses.map((x, idx) => (indexedAddresses[idx] = x));
  const serializedAddresses = JSON.stringify(indexedAddresses);
  await fs.writeFile("client/src/walletAddresses.json", serializedAddresses);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//////////////////////

const { MerkleTree } = require("merkletreejs");
const { keccak256 } = require("ethereumjs-util");
const { BigNumber } = require("ethers");
const fs = require("fs").promises;

async function main() {
  // Get 10 signers
  const signers = await ethers.getSigners();

  // Define custom addresses for some signers
  const customAddresses = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
    "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
  ];

  // Array of signer addresses
  const walletAddresses = customAddresses.map((customAddress, index) => {
    signers[index].address = customAddress;
    return signers[index].address;
  });

  // Define claim amounts for each signer
  const claimAmounts = [
    BigNumber.from("3000000000000000000"),
    BigNumber.from("5000000000000000000"),
    BigNumber.from("7000000000000000000"),
    BigNumber.from("4000000000000000000"),
    BigNumber.from("6000000000000000000"),
    BigNumber.from("8000000000000000000"),
    BigNumber.from("9000000000000000000"),
    BigNumber.from("2000000000000000000"),
    BigNumber.from("1000000000000000000"),
    BigNumber.from("4000000000000000000"),
  ];

  // Generate wallet data
  const walletData = walletAddresses.map((account, index) => {
    const claimAmount = claimAmounts[index];
    return {
      account: account,
      amount: claimAmount.toString(),
    };
  });

  // Write wallet data to JSON file
  const serializedWalletData = JSON.stringify(walletData);
  await fs.writeFile("client/src/walletData.json", serializedWalletData);

  // Generate Merkle tree
  const leaves = walletData.map(({ account, amount }) => {
    const leafData = ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [account, amount]
    );
    return Buffer.from(leafData.substr(2), "hex");
  });
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  // Generate Merkle proofs
  const merkleProofs = leaves.map((leaf) =>
    tree.getProof(leaf).map((step) => step.data)
  );

  // Deploy PuffCoin contract
  const PuffCoin = await ethers.getContractFactory("PuffCoin", signers[0]);
  const token = await PuffCoin.deploy();

  // Deploy MerkleDistributor contract with the calculated Merkle root
  const MerkleDistributor = await ethers.getContractFactory(
    "MerkleDistributor",
    signers[0]
  );
  const distributor = await MerkleDistributor.deploy(
    token.address,
    tree.getHexRoot()
  );

  // Mint tokens to the distributor contract
  await token
    .connect(signers[0])
    .mint(distributor.address, BigNumber.from("90000000000000000000"));

  // Print contract and signer addresses, and the Merkle root
  console.log("PuffCoin:", token.address);
  console.log("MerkleDistributor:", distributor.address);
  console.log("Signer addresses:", walletAddresses);
  console.log("32-byte Merkle root:", tree.getHexRoot());
  console.log("Merkle Proofs:");
  merkleProofs.forEach((proof) => {
    const bytes32Proof = proof.map((step) => ethers.utils.hexlify(step));
    console.log(bytes32Proof);
  });

  // Write wallet addresses to a JSON file for frontend use
  const indexedAddresses = {};
  walletAddresses.forEach((address, idx) => {
    indexedAddresses[idx] = address;
  });
  const serializedAddresses = JSON.stringify(indexedAddresses);
  await fs.writeFile("client/src/walletAddresses.json", serializedAddresses);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
