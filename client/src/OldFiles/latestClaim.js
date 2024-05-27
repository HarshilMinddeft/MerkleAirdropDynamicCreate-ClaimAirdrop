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
      fetchData();
    } catch (error) {
      console.error("Error initializing contract:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/fetchData");
      console.log(response.data);
      const documents = response.data; // Assuming response.data is an array of documents

      // Initialize arrays to store addresses, claim amounts, and proofs
      let allAddresses = [];
      let allClaimAmounts = [];
      let allProofs = [];

      // Iterate over each document
      for (const document of documents) {
        const addresses = document.addresses;
        const claimAmounts = document.claimAmounts;

        // Store addresses and claim amounts for each document
        allAddresses.push(...addresses);
        allClaimAmounts.push(...claimAmounts);

        // Calculate Merkle tree and proofs for each document
        const indexedAddresses = addresses.reduce((acc, address, index) => {
          acc[address] = claimAmounts[index];
          return acc;
        }, {});
        const tree = getTree(indexedAddresses);
        const proofs = addresses.map((address) => {
          const claimAmount = indexedAddresses[address];
          return getProof(tree, address, claimAmount);
        });

        // Store proofs for each document
        allProofs.push(...proofs);
      }

      // Set state variables with combined data
      setClaimAmount({
        ...allAddresses.reduce((acc, address, index) => {
          acc[address] = allClaimAmounts[index];
          return acc;
        }, {}),
      });
      setTree(
        getTree({
          ...allAddresses.reduce((acc, address, index) => {
            acc[address] = allClaimAmounts[index];
            return acc;
          }, {}),
        })
      );
      setProof(allProofs);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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

  const getProof = (tree, address, claimAmount) => {
    const addressBytes = ethers.utils.arrayify(address);
    const claimAmountBigNumber = ethers.BigNumber.from(claimAmount);
    const leafData = ethers.utils.concat([
      addressBytes,
      ethers.utils.hexZeroPad(claimAmountBigNumber.toHexString(), 32),
    ]);
    const leafDataHash = ethers.utils.keccak256(leafData);
    return tree.getHexProof(leafDataHash);
  };

  const isConnected = () => signer !== undefined;
  const connect = () => {
    getSigner(provider).then((signer) => {
      setSigner(signer);
    });
  };

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
    // setProof(proof);
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


const testClaimFunction = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(); // Use a JSON RPC provider instead of Web3Provider
    const signer = provider.getSigner();

    const distributorAddress = [
      "0x8aCd85898458400f7Db866d53FCFF6f0D49741FF",
      "0xe082b26cEf079a095147F35c9647eC97c2401B83",
    ];
    const signerAddresss = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    const proofie = [
      [
        "0xd016b9dcc89d9d0ccf4f7cadc2a07e6c7d5c52f0f357b79cecc288b332952a38",
        "0xc585c5289853b9b8b7710036b30d6f897d7336d040e87c9c692e2a9aa905d055",
        "0x4d65b36b3754d68a16a3545400a02b08b41a363fad04e867bbab7c29a5f5aeca",
        "0x361fba23d5d8b2ef8ab8d80916e624bb542aa1676ebc23b1ea8c8e24958e8c02",
      ],
      [
        "0x1d778914d822623bd42df51938ad5c68db692657df6d110ac607381f1d87009b",
        "0xe4e07b877666cf0759a430bfc2993fd628bed3e694825181ffd926fe25ea8e7b",
        "0x013390647bbce8fc2b0435b7c8963bff365149078b71fbeca4cc2ee5dbb08e81",
        "0x5e9962b4c013d2186a64e001dc11af6c73d8be8aaef75b7b0e86ec9827d465f5",
      ],
    ];
    const amountss = ["7000000000000000000", "2000000000000000000"];

    console.log("Sending claim transaction...");

    const contractAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
    const contract = new ethers.Contract(
      contractAddress,
      artifact.abi,
      signer
    );

    await Promise.all(
      distributorAddress.map(async (distributor, index) => {
        const tx = await contract.claim(
          distributorAddress,
          signerAddresss,
          amountss,
          proofie
        );
        await tx.wait(); // Wait for transaction confirmation
      })
    );
    console.log("Airdrop claimed successfully");
  } catch (error) {
    console.error("Error claiming airdrop:", error);
    // Handle errors
  }
};



