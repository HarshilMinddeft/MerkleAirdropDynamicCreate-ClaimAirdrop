const { MerkleTree } = require("merkletreejs");
const KECCAK256 = require("keccak256");
const { BigNumber, utils } = require("ethers");
const fs = require("fs").promises;
// const Users = require("../server/model/userModel.js");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  addresses: [String],
  claimAmounts: [String],
});

// Create and register Users model with Mongoose
const Users = mongoose.model("Users", userSchema);

const URL =
  "mongodb+srv://harshil:harshil8888@cluster0.nguunro.mongodb.net/AirdropApp?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(URL)
  .then(async () => {
    console.log("db connected");
  })
  .catch((error) => console.log(error));

////////////////////////////////////////////////////////////////
async function main() {
  const signers = await ethers.getSigners();
  const users = await Users.find({}, "addresses claimAmounts");
  console.log("Users Merkledrop data :", users);
  const customAddresses = users.map((user) => user.addresses);
  const claimAmounts = users.map((user) => user.claimAmounts);

  // Convert addresses to wallet addresses format
  const walletAddresses = customAddresses;
  // Define custom addresses for some signers
  // const customAddresses = [
  //   "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  //   "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  //   "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  //   "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  //   "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  //   "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
  //   "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
  //   "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
  //   "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
  //   // "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
  // ];

  // Array of signer addresses
  // const walletAddresses = customAddresses.map((customAddress, index) => {
  //   signers[index].address = customAddress;
  //   return signers[index].address;
  // });

  // const claimAmounts = [
  //   BigNumber.from("3000000000000000000"),
  //   BigNumber.from("5000000000000000000"),
  //   BigNumber.from("7000000000000000000"),
  //   BigNumber.from("4000000000000000000"),
  //   BigNumber.from("6000000000000000000"),
  //   BigNumber.from("8000000000000000000"),
  //   BigNumber.from("9000000000000000000"),
  //   BigNumber.from("2000000000000000000"),
  //   BigNumber.from("1000000000000000000"),
  //   // BigNumber.from("400000000000000000"),
  // ];
  //
  const flatAddresses = walletAddresses.flat();
  const leaves = flatAddresses.map((account, index) => {
    const claimAmount = claimAmounts[index];
    const addressBytes = ethers.utils.arrayify(account);
    // const leafData = KECCAK256(
    //   Buffer.concat([
    //     Buffer.from(account, "hex"),
    //     Buffer.from(claimAmount.toString(), "hex"),
    //   ])
    // );
    // const leafData = ethers.utils.keccak256(
    //   ethers.utils.defaultAbiCoder.encode(
    //     ["address", "uint256"],
    //     [account, claimAmount.toString()]
    //   )
    // );
    const leafData = Buffer.from(
      utils
        .solidityKeccak256(
          ["address", "uint256"],
          [account.toString(), claimAmount]
        )
        .substr(2),
      "hex"
    );
    return leafData;
  });
  const tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });

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

  await token
    .connect(signers[0])
    .mint(distributor.address, BigNumber.from("90000000000000000000"));

  console.log("PuffCoin:", token.address);
  console.log("MerkleDistributor:", distributor.address);
  console.log("Signer addresses:", walletAddresses);
  console.log("32-byte Merkle root:", tree.getHexRoot());
  console.log("Merkle Proofs:");
  const merkleProofs = [];

  leaves.forEach((leaf, index) => {
    const proof = tree.getHexProof(leaf);
    merkleProofs.push(proof);
  });

  merkleProofs.forEach((proof, index) => {
    // Format each proof individually
    const formattedProof = proof.map((step) => step);
    console.log("Proof for address", index + 1, ":", formattedProof);
  });

  const indexedAddresses = {};
  walletAddresses.forEach((address, idx) => {
    indexedAddresses[idx] = {
      address: address,
      claimAmount: claimAmounts,
    };
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
