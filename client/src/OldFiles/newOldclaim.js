import React, { useEffect, useState } from "react";
import KECCAK256 from "keccak256";
import { ethers } from "ethers";
import axios from "axios";
import MerkleTree from "merkletreejs";
import { Buffer } from "buffer/";
import artifact from "../artifacts/contracts/MerkleDistributorFactory.sol/MerkleDistributorFactory.json";
import Navbar from "../Navbar";
import "./App.css";
const { utils } = require("ethers");
const distributorAddress = [
  "0x75537828f2ce51be7289709686A69CbFDbB714F1",
  "0xE451980132E65465d0a498c53f0b5227326Dd73F",
];
window.Buffer = window.Buffer || Buffer;

function UserClaim() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);
  const [tree, setTree] = useState(undefined);
  const [proof, setProof] = useState([]);
  const [claimStatus, setClaimStatus] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [claimAmount, setClaimAmount] = useState({});
  const [storeContractA, setStoreContractA] = useState("");

  useEffect(() => {
    const fetchContractAddress = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/fetchData");
        const contractAddressdb = response.data.contractAddress;
        const contractAddressString = contractAddressdb.join(",");
        setStoreContractA(contractAddressString);
        console.log("Address of contract:", contractAddressString);
        onLoad(contractAddressString);
      } catch (error) {
        console.error("Error fetching contract address:", error);
      }
    };
    fetchContractAddress();
  }, []);

  const onLoad = async (contractAddress) => {
    try {
      if (window.ethereum == null) {
        throw new Error("metakask not installed");
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let selectedAccount = accounts[0];
      if (!selectedAccount) {
        throw new Error("No ethereum account awailable");
      }
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const contract = await new ethers.Contract(
        contractAddress,
        artifact.abi,
        provider
      );
      setContract(contract);
      // const tokenAddress = await distributorAddress.token();
      // setTokenAddress(tokenAddress);
      fetchData();
    } catch (error) {
      console.error("Error initializing contract:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/fetchData");
      console.log(response.data);
      const addresses = response.data.addresses;
      const claimAmounts = response.data.claimAmounts;

      const indexedAddresses = addresses.reduce((acc, address, index) => {
        acc[address] = claimAmounts[index];
        return acc;
      }, {});
      setClaimAmount(indexedAddresses);
      const tree = getTree(indexedAddresses);
      setTree(tree);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const isConnected = () => signer !== undefined;
  const connect = () => {
    getSigner(provider).then((signer) => {
      setSigner(signer);
    });
  };

  const getTree = (indexedAddresses) => {
    const leaves = Object.keys(indexedAddresses).map((address) => {
      const addressBytes = ethers.utils.arrayify(address);
      const claimAmountBigNumber = ethers.BigNumber.from(
        indexedAddresses[address]
      );
      const leafData = ethers.utils.concat([
        addressBytes,
        ethers.utils.hexZeroPad(claimAmountBigNumber.toHexString(), 32),
      ]);
      const leafHash = utils.solidityKeccak256(["bytes"], [leafData]);
      return leafHash;
    });
    const tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });
    console.log("Generated Merkle Root:", tree.getHexRoot());
    return tree;
  };
  // const getSigner = async (provider) => {
  //   const signer = await provider.getSigner();
  //   const address = await signer.getAddress();
  //   setSignerAddress(address);

  //   // Find the signer's claim amount
  //   const signerClaimAmounts = claimAmounts.find(
  //     (indexedAddresses) => indexedAddresses[address]
  //   );
  //   const claimAmountForSigner = signerClaimAmounts[address];
  //   console.log("ClaimAmountofSigner", claimAmountForSigner);

  //   if (!signerClaimAmounts) {
  //     throw new Error("Signer claim amount is undefined");
  //   }

  //   // Find the tree corresponding to the signer's address
  //   const signerTree = trees.find((tree) =>
  //     Object.keys(tree.leaves).includes(address)
  //   );

  //   // Generate proof for the signer's address
  //   const proof = getProof(signerTree, claimAmountForSigner);
  //   setProofs([proof]); // Set proof only for the signer
  //   console.log(proofs);
  //   return signer;
  // };

  const getSigner = async (provider) => {
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setSignerAddress(address);
    const signerClaimAmount = claimAmount[address];
    console.log(signerClaimAmount);
    if (signerClaimAmount === undefined) {
      console.log(signerClaimAmount);
      throw new Error("Signer claim amount is undefined ????");
    }
    const addressBytes = ethers.utils.arrayify(address);
    const claimAmountBigNumber = ethers.BigNumber.from(signerClaimAmount);
    const leafData = ethers.utils.concat([
      addressBytes,
      ethers.utils.hexZeroPad(claimAmountBigNumber.toHexString(), 32),
    ]);
    const leafDataHash = ethers.utils.keccak256(leafData);
    const proof = tree.getHexProof(leafDataHash);
    setProof(proof);
    // console.log("Generated Proof:", proof);
    return signer;
  };
  const claimAirdrop = async () => {
    try {
      if (!signerAddress) {
        throw new Error("Signer address is undefined");
      }
      const formattedSignerAddress = signerAddress;
      const signerClaimAmount = claimAmount[formattedSignerAddress];

      if (!signerClaimAmount) {
        throw new Error("Signer claim amount is undefined");
      }
      const proofBytes32 = proof.map((p) => ethers.utils.hexlify(p));
      console.log("Sending claim transaction...");
      const tx = await contract
        .connect(signer)
        .claim(
          distributorAddress,
          signerAddress,
          signerClaimAmount,
          proofBytes32
        );
      await tx.wait();
      setClaimStatus("Airdrop claimed successfully");
      console.log("Airdrop claimed successfully:", tx.hash);
    } catch (error) {
      console.error("Error claiming airdrop:", error);
      if (error.message.includes("Drop already claimed")) {
        setClaimStatus("Airdrop has already been claimed");
      } else if (error.message.includes("User denied transaction")) {
        setClaimStatus("Transaction Denied");
        console.log("Transaction was rejected by the user");
      } else if (error.message.includes("Invalid proof")) {
        setClaimStatus("Sorry you are not eligible");
      } else {
        setClaimStatus("Error claiming airdrop");
      }
    }
  };

  return (
    <>
      <div className="App">
        <Navbar />
        <div className="bg-air.webp">
          <header className="App-header">
            {isConnected() ? (
              <div>
                <h2>TokenAddress-: {tokenAddress}</h2>
                <p className="same"> Hii {signerAddress?.substring()}</p>
                <div className="list-group">
                  <div className="list-group-item">
                    <button
                      className="btn btn-success"
                      onClick={() => claimAirdrop()}
                    >
                      Claim Your Airdrop
                    </button>
                  </div>
                  {claimStatus && (
                    <div className="list-group-item">
                      <p>{claimStatus}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="Connect">You are not connected</p>
                <button onClick={connect} className="btn btn-primary">
                  Connect Metamask
                </button>
                {/* <p>{storeContractA}</p> */}
              </div>
            )}
          </header>
        </div>
      </div>
    </>
  );
}

export default UserClaim;
